#include <iostream>
#include <armadillo>

int main() {

	arma::mat M(10, 10, arma::fill::randu);

	std::cout << M << std::endl;

	return 0;
}
