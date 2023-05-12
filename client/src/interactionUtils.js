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


export const getIntersectInfo = (scene, intersect, targetGroupName) => {
    let intersectPosX, intersectPosY, intersectIndex, intersectObject;

    try {
        intersectIndex = scene.scene.getObjectByName(targetGroupName).children.findIndex(
            (c) => c.uuid === intersect.object.uuid
        );
        intersectObject = scene.scene.getObjectByName(targetGroupName).children[intersectIndex];

        intersectPosX = intersectObject.position.x;
        intersectPosY = intersectObject.position.y;
    } catch (err) {
        console.log("error")
        return {
            index: undefined,
            object: undefined,
            position: {
                x: undefined,
                y: undefined,
            },
        };
    }

    return {
        index: intersectIndex,
        object: intersectObject,
        position: {
            x: intersectPosX,
            y: intersectPosY,
        },
    };
}
