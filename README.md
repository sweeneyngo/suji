# suji

![](https://img.shields.io/github/actions/workflow/status/sweeneyngo/suji/deploy-build.yml)

A Sudoku (["what is this?"](https://en.wikipedia.org/wiki/Sudoku)) interface designed to demonstrate + compare various Sudoku solving algorithms. For more information, visit [this Wikipedia link.](https://en.wikipedia.org/wiki/Sudoku_solving_algorithms)

The application is written in Typescript + [React](https://react.dev/) and built with [Vite](https://vitejs.dev/).

<p align="center">
<a href="https://ifuxyl.dev/suji">
<img src="https://i.imgur.com/V3YbtO3.png"><br>
<sup><strong>ifuxyl.dev/suji</a></strong></sup>
</p>

## Algorithms
As of this implementation, the following Sudoku solving algorithms are available:

**Backtracking**
  - A brute force algorithm (depth-first) that attempts every valid digit sequentially, and returning to previous cells if a solution can not be found. The simplest, yet effective method as all puzzles, regardless of difficulty, can be solved with this algorithm.

**Backtracking (sorted)**
  - A variant of the Backtracking algorithm that opts to sort the empty cells by the remaining candidate values from lowest to highest. It generally achieves a faster solution rate to the previous strategy with this optimization.

**Candidate-checking**
  - An algorithm focused on **elimination**; for each empty cell, it checks which valid digits are possible based on the concept of [naked singles](https://www.sudokuwiki.org/Naked_Candidates). It can reliably solve most simpler puzzles, but harder puzzles will require other algorithms and/or backtracking.

**Place-finding**
  - An algorithm focused on **insertion**; for each number, it determines which empty cells can validly hold that value based on the concept of [naked singles](https://www.sudokuwiki.org/Naked_Candidates). This method, like candidate-checking, might not solve the puzzle fully and may require more advanced techniques once no more placements can be made.

**Crook's Algorithm**
  - [Crook's Algorithm](https://www.ams.org/notices/200904/tx090400460p.pdf) (designed by J. F. Crook) is a more advanced Sudoku solving technique that is a variant of the Place-finding algorithm, but extends to "preemptive sets" (m>2). A preemptive set is a list of m numbers, together with a list of m cells, with the property that no numbers other than the m numbers from the list can occupy the m cells. This property is the basis for Naked Pairs, Triples, Quads, etc. The implementation focuses on reducing the candidates by the existing preemptive sets, then adopt the Place-finding strategy to isolate naked singles. Unlike the previous two, the Crook's algorithm can effectively solve every puzzle regardless of difficult, and is popularized as the "Pen-and-paper" approach.

**Simulated Annealing**
- A probabilistic/stochastic algorithm (similar to Genetic algorithms) inspired by the physical process of annealing in metallurgy, where materials are heated and then slowly cooled to reach a stable state. In the context of solving Sudoku, this method is used to explore the solution space in a way that avoids getting stuck in local minima (suboptimal solutions). While known to be efficient, it can't compete with the previous deductive methods in Sudoku. Unlike the latter however, these type of algorithms aren't based on logic, giving them the potential to solve a wider range of problems. For this implementation, the initial temperature is dynamically determined from the board's state, and the cooling rate is optimized to 0.99.

**Pattern Matching**
- An algorithm that emerges from a simple principle: there exists pre-calculated solution "patterns" where each digit can feasibly go. It leverages patterns for faster resolution, especially for the final steps in solving a Sudoku puzzle. For each number, there are only 46,656 valid possible configurations or "patterns" for the distribution of numbers within a Sudoku grid. This implementation determines all configurations given the current grid state & remaining empty cells for each digit (hard limit capped at 46,656), and compacts them as bit vectors.

## Building
Not necessarily in active development, but we welcome any contributions. Feel free to submit an issue or contribute code via PR to the `main` branch.

You need [Node.js v22](https://nodejs.org/en/) for the frontend.

To build the site for development:
```bash
# If you don't have Node v22 or pnpm v9:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
nvm install node
npm install -g pnpm

# Install in project root
pnpm install && pnpm run dev
```

You should now access the webpage at `http://localhost:5173/suji/`,
Any changes in `src` will be immediately available through [Vite](https://vitejs.dev/).

<!-- ### Deployment
```bash
fly deploy
``` -->

## License

<sup>
All code is licensed under the <a href="LICENSE">MIT license</a>.
</sup>
