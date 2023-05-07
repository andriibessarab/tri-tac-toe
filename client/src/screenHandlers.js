export const setMousePosition = (event, mouse) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}


export const getRaycasterIntersects = (event, scene, mouse, raycaster, targetGroupName) => {
    // Set up raycaster
    raycaster.setFromCamera(mouse, scene.camera);

    let intersects;
    try {
        intersects = raycaster.intersectObjects(
            scene.scene.getObjectByName(targetGroupName).children
        );
    } catch (err) {
        return [];
    }

    return intersects;
}
