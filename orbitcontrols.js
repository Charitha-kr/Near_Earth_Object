// orbitcontrols.js
import * as THREE from './three.module.min.js'; // Import Three.js

class OrbitControls {
    constructor(object, domElement) {
        this.object = object;
        this.domElement = domElement;
        this.isMouseDown = false;
        this.startX = 0;
        this.startY = 0;

        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    }

    onMouseDown(event) {
        this.isMouseDown = true;
        this.startX = event.clientX;
        this.startY = event.clientY;
    }

    onMouseUp() {
        this.isMouseDown = false;
    }

    onMouseMove(event) {
        if (this.isMouseDown) {
            const deltaX = event.clientX - this.startX;
            const deltaY = event.clientY - this.startY;

            this.object.rotation.y -= deltaX * 0.01; // Adjust the sensitivity
            this.object.rotation.x -= deltaY * 0.01; // Adjust the sensitivity

            this.startX = event.clientX;
            this.startY = event.clientY;
        }
    }

    update() {
        // Update controls here if needed
    }
}

// Export the OrbitControls class
export { OrbitControls };
