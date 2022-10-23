import * as THREE from 'three';
import {
    OrbitControls
} from 'https://unpkg.com/three@0.139.2/examples/jsm/controls/OrbitControls.js';

export function main() {

      const GAP = 1;
		
				const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera.position.set(0,10,10);
			camera.lookAt( 0, 0, 0 );


			const renderer = new THREE.WebGLRenderer({antialias:true});
			renderer.setSize( window.innerWidth, window.innerHeight );
			document.body.appendChild( renderer.domElement );

			const controls = new OrbitControls( camera, renderer.domElement );
			controls.update();

			const cells = [
				[{height: 1},{height: 0},{height:2}],
				[{height: 4},{height: 1},{height:5}],
				[{height: 1},{height: 0},{height:0}]
			];
			const cubes = [];

								console.log('init');

			for(let z=0; z<cells.length; z++) {
				for(let x=0 ; x<cells[0].length; x++) {
									console.log('init');

					const cell = cells[z][x];
					console.log(cell);
					const material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true}  );
					const geometry = new THREE.BoxGeometry( 0.9, cell.height, 0.9 );
					const cube = new THREE.Mesh( geometry, material );
					cube.position.set(x,(cell.height/2),z);
					scene.add( cube );
					cubes.push(cube);
			}
		}



			function animate() {
				requestAnimationFrame( animate );
				
				// cubes.map((cube)=> {
				// 	cube.rotation.y += 0.01;
					
				// })
				
				// controls.update();
				renderer.render( scene, camera );
			}
			animate();
}
	