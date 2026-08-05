import ctypes
import os

# 1. Expand system file limits for massive model memory mapping
os.system("ulimit -HSn 102400")

# 2. Define Output Structs for Callback Parsing
class RKLLMResultLastHiddenLayer(ctypes.Structure):
    _fields_ = [("embd_data", ctypes.c_void_p), ("embd_size", ctypes.c_uint64)]

class RKLLMResultLogits(ctypes.Structure):
    _fields_ = [("logits_data", ctypes.c_void_p), ("logits_size", ctypes.c_uint64)]

class RKLLMPerfStat(ctypes.Structure):
    _fields_ = [
        ("prompt_tokens", ctypes.c_int),
        ("completion_tokens", ctypes.c_int),
        ("prompt_time", ctypes.c_float),
        ("completion_time", ctypes.c_float)
    ]

class RKLLMResult(ctypes.Structure):
    _fields_ = [
        ("text", ctypes.c_char_p),         
        ("token_id", ctypes.c_int),
        ("last_hidden_layer", RKLLMResultLastHiddenLayer),
        ("logits", RKLLMResultLogits),     
        ("perf", RKLLMPerfStat)
    ]

# 3. Flawless 64-Byte Continuous Block Input Structure
# This layout eliminates any platform-specific C-struct padding bugs.
class RKLLMInput(ctypes.Structure):
    _fields_ = [("raw_data", ctypes.c_uint8 * 64)]

class RKLLMInferParam(ctypes.Structure):
    _fields_ = [
        ("mode", ctypes.c_int),            
        ("reserved", ctypes.c_uint8 * 128) 
    ]

class RKLLMParam(ctypes.Structure):
    _fields_ = [("opaque_buffer", ctypes.c_uint8 * 1024)]

# 4. Text Stream Callback Definition
CALLBACK_TYPE = ctypes.CFUNCTYPE(None, ctypes.POINTER(RKLLMResult), ctypes.c_void_p, ctypes.c_int)

def text_stream_callback(result_pointer, userdata, state):
    if result_pointer and result_pointer.contents.text:
        token_string = result_pointer.contents.text.decode('utf-8', errors='ignore')
        print(token_string, end="", flush=True)

c_callback = CALLBACK_TYPE(text_stream_callback)

# 5. Load and Map driver signatures
try:
    librkllm = ctypes.CDLL("librkllmrt.so")
except OSError as e:
    print(f"Driver library mismatch or missing path alignment:\n{e}")
    exit(1)

librkllm.rkllm_createDefaultParam.argtypes = []
librkllm.rkllm_createDefaultParam.restype = RKLLMParam

librkllm.rkllm_init.argtypes = [ctypes.POINTER(ctypes.c_void_p), ctypes.POINTER(RKLLMParam), ctypes.c_void_p]
librkllm.rkllm_init.restype = ctypes.c_int

librkllm.rkllm_run.argtypes = [ctypes.c_void_p, ctypes.POINTER(RKLLMInput), ctypes.POINTER(RKLLMInferParam), ctypes.c_void_p]
librkllm.rkllm_run.restype = ctypes.c_int

librkllm.rkllm_destroy.argtypes = [ctypes.c_void_p]
librkllm.rkllm_destroy.restype = ctypes.c_int

# 6. Initialize default config blocks
main_config = librkllm.rkllm_createDefaultParam()
model_path_bytes = b"./qwen3_5_4b.rkllm"
path_pointer = ctypes.c_char_p(model_path_bytes)
ctypes.memmove(ctypes.byref(main_config), ctypes.byref(path_pointer), ctypes.sizeof(ctypes.c_char_p))

# 7. Initialize model on NPU
model_handle = ctypes.c_void_p()
print("Loading model onto the 3 NPU cores... Please wait.")
ret = librkllm.rkllm_init(ctypes.byref(model_handle), ctypes.byref(main_config), c_callback)

if ret != 0:
    print(f"Initialization sequence aborted by hardware. Code: {ret}")
    exit(ret)
print("Model loaded successfully into hardware blocks!\n" + "="*50)

# 8. Interactive loop
try:
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ['exit', 'quit']:
            break
        if not user_input.strip():
            continue
            
        formatted_prompt = f"<|im_start|>user\n{user_input}<|im_end|>\n<|im_start|>assistant\n"
        print("\nQwen: ", end="", flush=True)
        
        # Instantiate a zeroed-out 64-byte continuous array block
        input_data = RKLLMInput()
        
        # Manually pack raw values safely into explicit byte offset boundaries:
        # Byte [0-7]:   pointer to role string (b"user")
        # Byte [8-11]:  enable_thinking flag (False = 0)
        # Byte [16-19]: input_type enum flag (PROMPT = 0)
        # Byte [24-31]: pointer to target prompt text string matrix
        
        role_ptr = ctypes.c_char_p(b"user")
        prompt_ptr = ctypes.c_char_p(formatted_prompt.encode('utf-8'))
        
        ctypes.memmove(ctypes.byref(input_data.raw_data, 0), ctypes.byref(role_ptr), 8)
        ctypes.memset(ctypes.byref(input_data.raw_data, 8), 0, 4)  # enable_thinking = 0
        ctypes.memset(ctypes.byref(input_data.raw_data, 16), 0, 4) # input_type = 0
        ctypes.memmove(ctypes.byref(input_data.raw_data, 24), ctypes.byref(prompt_ptr), 8)
        
        infer_params = RKLLMInferParam(
            mode=0, 
            reserved=(ctypes.c_uint8 * 128)()
        )
        
        # Run inference using the zero-padded linear memory format
        librkllm.rkllm_run(model_handle, ctypes.byref(input_data), ctypes.byref(infer_params), None)
        print() 

finally:
    print("\nUnloading model from NPU memory...")
    librkllm.rkllm_destroy(model_handle)
    print("Session closed cleanly.")

