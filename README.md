This project simulates a rescue robot placed on a 2D grid. The robot starts at a given source grid S and must reach a destination grid D to rescue people. The robot can move up, down, left, or right, and there may be multiple possible paths.

Some grids on the map are blocked, meaning the robot cannot pass through them.

An additional challenge is the presence of spreading fire. Both the robot and the fire move at the same speed — one grid per time unit. If the fire reaches any grid before the robot does, that grid becomes unsafe. If the robot tries to enter a grid that the fire has already reached, the mission fails.

The goal of the project is to determine whether the robot can safely reach the destination D before the fire blocks all possible paths. The program checks all valid movement options, considers the fire spread, and decides if a successful rescue is possible.
