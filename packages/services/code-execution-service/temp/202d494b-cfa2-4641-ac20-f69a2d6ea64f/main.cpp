#include <iostream>
#include <string>

int main() {
    std::string name;
    std::cout << "Please enter your name: " << std::flush;
    std::cin >> name;
    std::cout << "Hello, " << name << "! Your C++ program ran successfully.";
    return 0;
}