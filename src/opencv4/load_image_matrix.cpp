#include <opencv2/core.hpp>
#include <opencv2/core/utility.hpp>
#include "opencv2/imgcodecs.hpp"
#include <opencv2/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <iostream>
#include <sstream>

using namespace std;
using namespace cv;

int main() {
	Mat I, J;
	const int times = 10000;
	I = imread("te.png", IMREAD_COLOR);
	for (int i = 0; i < times; ++i)
	{
		Mat clone_i = I.clone();
	}
	
	/*
	for (int i = 0; i < 10000; i++)
	{
		// You cannot perform below activity because Matrix is image which matrix of matrix
		// i.e. cooridnate than rgb.
		// J = I * I;
	
	}
	*/

	// Use UMat for automatic OpenCL acceleration
	UMat gpu_img, blurred_gpu_img;

	// Data is automatically transferred to GPU memory
	gpu_img = I.getUMat(cv::ACCESS_READ);
	
	for (int i = 0; i < 10000; i++) {
	// This operation will run on the GPU if OpenCL is enabled
	GaussianBlur(gpu_img, blurred_gpu_img, Size(5, 5), 0);
	}
	
	// Data is automatically transferred back to CPU memory when needed
	Mat output_cpu = blurred_gpu_img.getMat(cv::ACCESS_READ);

	
	return 0;
}
