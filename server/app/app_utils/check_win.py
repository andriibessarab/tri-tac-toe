# Check if either marker won
def check_win(board):
    for p in ('x', 'o'):
        for i in range(3):
            if any([check_horizontal_win(board, p, i), check_vertical_win(board, p, i)]):
                return p
        if check_diagonal_win(board, p):
            return p
    return ""


# Check for win in horizontal line
def check_horizontal_win(board, p, i):
    return all(mark == p for mark in board[i])


# Check for win in vertical line
def check_vertical_win(board, p, j):
    return all(mark == p for mark in [board[i][j] for i in range(3)])


# Check for win in diagonal line
def check_diagonal_win(board, p):
    return any([
        all(mark == p for mark in [board[i][i] for i in range(3)]),
        all(mark == p for mark in [board[i][2 - i] for i in range(3)])
    ])


# Tests
if __name__ == "__main__":
    board1 = [["x", "o", "x"],
              ["o", "o", "x"],
              ["x", "o", "x"]
              ]
    print(check_win(board1))  # x

    board2 = [["o", "o", "x"],
              ["o", "x", "x"],
              ["x", "o", "o"]
              ]
    print(check_win(board2))  # x

    board3 = [["o", "o", "o"],
              ["x", "o", "x"],
              ["x", "x", "o"]
              ]
    print(check_win(board3))  # o

    board4 = [["x", "o", "x"],
              ["o", "o", "x"],
              ["x", "x", "o"]
              ]
    print(check_win(board4))  # draw (empty string)
