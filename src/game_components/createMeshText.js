import {FontLoader} from "three/addons/loaders/FontLoader";
import {TextGeometry} from "three/addons/geometries/TextGeometry";
import * as THREE from "three";

const fontLoader = new FontLoader();

function createMeshText(text, fontSize, fontHeight, xOffset, yOffset, setScaleToZeros = false) {
    return new Promise((resolve, reject) => {
        fontLoader.load("/assets/fonts/changa_one_regular.json", (loadedFont) => {
            const textGeometry = new TextGeometry(text, {
                font: loadedFont,
                size: fontSize,
                height: fontHeight,
            });
            const textMaterial = new THREE.MeshNormalMaterial();
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.x = xOffset;
            textMesh.position.y = yOffset;
            textMesh.scale.z = 1;
            if (setScaleToZeros) {
                textMesh.scale.x = 0;
                textMesh.scale.y = 0;

            }
            resolve(textMesh);
        }, undefined, reject);
    });
}

export default createMeshText;
