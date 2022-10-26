import * as THREE from 'three';
import {
	OrbitControls
} from 'https://unpkg.com/three@0.139.2/examples/jsm/controls/OrbitControls.js';

const ROW_SIZE = 30;
const SUNLIGHT_COLOR = '#fdfbd3'
const MAX_HEIGHT = ROW_SIZE / 4;

function getRandomHeight() {
	const isLive = Math.floor(Math.random() * 10) === 1
	if (!isLive) {
		return 0;
	}

	return Math.floor(Math.random() * MAX_HEIGHT) + 1;

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
	const scene = new THREE.Scene();

	const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
	scene.add(ambientLight);
	const light = new THREE.PointLight(SUNLIGHT_COLOR, 1, 500, 2);
	light.position.set(ROW_SIZE, ROW_SIZE, ROW_SIZE);
	scene.add(light);

	const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(ROW_SIZE * 2, ROW_SIZE * 1.5, ROW_SIZE * 2);
	camera.lookAt(ROW_SIZE / 2, 0, ROW_SIZE / 2);


	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	let cells = generateGrid(ROW_SIZE);
	const cubes = new Map();


	for (let y = 0; y < cells.length; y++) {
		for (let x = 0; x < cells[0].length; x++) {

			const cell = cells[y][x];
			// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
			const material = new THREE.MeshPhongMaterial({ color: '#8AC' });
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

		// cubes.map((cube)=> {
		// 	cube.rotation.y += 0.01;

		// })

		// controls.update();
		renderer.render(scene, camera);
	}
	animate();
	setInterval(() => {
		cells = calculateNextGrid(cells);
		updateCubes(cells, cubes);
	}, 1000)
}

function generateCubeKey(x, y) {
	return `x:${x}-y:${y}`;
}

function updateCubes(grid, cubes) {
	for (let y = 0; y < grid.length; y++) {
		for (let x = 0; x < grid[0].length; x++) {
			const cell = grid[y][x];
			const cube = cubes.get(generateCubeKey(x, y));
			cube.geometry.dispose();
			cube.geometry = new THREE.BoxGeometry(0.9, cell.height, 0.9);
			cube.position.set(x, (cell.height / 2), y);

		}
	}
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

	if(cellObject.height > 10) {
		return 0;
	}

	if (cellObject.height >= 1) {
		if (numNeighbors < 2) {
			return cellObject.height - 1;
		}
		if (numNeighbors == 2 || numNeighbors == 3) {
			return cellObject.height + 1;
		}
		if (numNeighbors > 3) {
			return cellObject.height - 1;
		}
	}

	if (cellObject.height === 0) {
		if (numNeighbors == 3) {
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

