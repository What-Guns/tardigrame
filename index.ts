import {Test} from './test.js';
import {Grid} from './grid.js';

const instance = new Test(4);

alert(instance.n);

const grid = new Grid(10, 10);
alert(`${grid.rows} rows by ${grid.columns} is ${grid.cells} cells!`);
