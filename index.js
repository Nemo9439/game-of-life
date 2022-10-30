import * as THREE from 'three';
import {
	OrbitControls
} from 'https://unpkg.com/three@0.139.2/examples/jsm/controls/OrbitControls.js';

const ROW_SIZE = 30;
const SUNLIGHT_COLOR = '#fdfbd3'
const COLORS = ['azure', 'orange', 'pink', 'tomato', 'whitesmoke', 'salmon', 'skyblue', 'orangered']

function buildSelectNextColor() {
	let counter = -1;
	return () => {
		counter++;
		const colorIndex = counter % COLORS.length;
		return COLORS[colorIndex];
	}
}

const getNextColor = buildSelectNextColor();

function getRandomHeight() {
	const isLive = Math.floor(Math.random() * 8) === 1
	if (!isLive) {
		return 0;
	}

	return 1;

}

function generateGrid(rowSize) {
	const grid = [];
	for (let i = 0; i < rowSize; i++) {
		const row = [];
		for (let j = 0; j < rowSize; j++) {
			const height = getRandomHeight();
			row[j] = { height };
		}
		grid[i] = row;
	}

	return grid;
};


export function main() {
	function changeSelectedColor() {
		selectedColor = getNextColor();
		scene.background = new THREE.Color(selectedColor);
	}
	THREE.ColorManagement.legacyMode = false;

	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	const scene = new THREE.Scene();
	let selectedColor;

	const ambientLight = new THREE.AmbientLight(SUNLIGHT_COLOR, 0.5); // soft white light
	scene.add(ambientLight);
	const light = new THREE.PointLight(SUNLIGHT_COLOR, 0.9, 1000);
	light.position.set(ROW_SIZE, ROW_SIZE, ROW_SIZE);
	scene.add(light);

	const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(ROW_SIZE * 2, ROW_SIZE * 1.5, ROW_SIZE * 2);
	camera.lookAt(ROW_SIZE / 2, 0, ROW_SIZE / 2);


	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	changeSelectedColor();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	let cells = generateGrid(ROW_SIZE);
	const cubes = new Map();



	for (let y = 0; y < cells.length; y++) {
		for (let x = 0; x < cells[0].length; x++) {

			const cell = cells[y][x];
			const material = new THREE.MeshPhongMaterial({ color: 'yellow' });
			const geometry = new THREE.BoxGeometry(0.9, cell.height, 0.9);
			const cube = new THREE.Mesh(geometry, material);
			cube.position.set(x, (cell.height / 2), y);
			scene.add(cube);
			const cubeKey = generateCubeKey(x, y);
			cubes.set(cubeKey, cube);
		}
	}



	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}

	animate();
	setInterval(() => {
		const newCells = calculateNextGrid(cells);
		updateCubes(cells, newCells, cubes);
		cells = newCells;
	}, 500)

	function onMouseClick(event) {
		changeSelectedColor();
	}

	function onMouseMove(event) {
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(scene.children, false);
		const object = intersects[0]?.object;
		if (!object) {
			return;
		}
		object.material.color.set(selectedColor);
		object.material.color.convertSRGBToLinear();

		const { position } = object;
		const y = position.z;
		const x = position.x;
		const selectedCell = cells[y][x];
		selectedCell.height = selectedCell.height > 0 ? 0 : 1;
		const cube = cubes.get(generateCubeKey(x, y));
		updateCube(selectedCell, cube);
	}

	window.addEventListener('click', onMouseClick, false);
	window.addEventListener('mousemove', onMouseMove, false);
}

function generateCubeKey(x, y) {
	return `x:${x}-y:${y}`;
}

function updateCubes(oldGrid, grid, cubes) {
	for (let y = 0; y < grid.length; y++) {
		for (let x = 0; x < grid[0].length; x++) {
			const oldCell = oldGrid[y][x];
			const cell = grid[y][x];
			if (oldCell.height === cell.height) {
				continue;
			}
			const cube = cubes.get(generateCubeKey(x, y));
			updateCube(cell, cube);

		}
	}
}



function updateCube(cell, cube) {
	cube.geometry.dispose();
	cube.geometry = new THREE.BoxGeometry(0.9, cell.height, 0.9);
	cube.position.y = cell.height / 2;
}

// game of life logic 
function calculateNextGrid(oldGrid) {
	const grid = [];
	for (let i = 0; i < oldGrid.length; i++) {
		const row = [];
		for (let j = 0; j < oldGrid[0].length; j++) {
			const height = calculateNewHeight(oldGrid, i, j);
			row[j] = { height };
		}
		grid[i] = row;
	}

	return grid;
}

function calculateNewHeight(grid, row, col) {
	const numNeighbors = countNeighbors(grid, row, col);
	const cellObject = grid[row][col];

	if (cellObject.height > 10) {
		return 1;
	}

	if (cellObject.height >= 1) {
		if (numNeighbors < 2) {
			return 0;
		}
		if (numNeighbors == 2 || numNeighbors == 3) {
			return cellObject.height + 1;
		}
		if (numNeighbors > 3) {
			return 0;
		}
	}

	if (cellObject.height === 0) {
		if (numNeighbors === 3) {
			return 1;
		}
	}

	return cellObject.height;
}

function countNeighbors(grid, row, col) {
	let count = 0;

	if (grid?.[row - 1]?.[col - 1]?.height >= 1) {
		count++;
	}
	if (grid?.[row - 1]?.[col]?.height >= 1) {
		count++;
	}
	if (grid?.[row - 1]?.[col + 1]?.height >= 1) {
		count++;
	}

	if (grid?.[row]?.[col - 1]?.height >= 1) {
		count++;
	}
	if (grid?.[row]?.[col + 1]?.height >= 1) {
		count++;
	}

	if (grid?.[row + 1]?.[col - 1]?.height >= 1) {
		count++;
	}
	if (grid?.[row + 1]?.[col]?.height >= 1) {
		count++;
	}
	if (grid?.[row + 1]?.[col + 1]?.height >= 1) {
		count++;
	}

	return count;
}


