import { Player } from "../player/player";

export function setupInstructions(player?: Player) {
    const isTouch = player?.isTouchDevice || ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Crosshair
    const crosshair = document.createElement('div');
    crosshair.id = 'crosshair';
    crosshair.innerHTML = '+';
    document.body.appendChild(crosshair);

    // Instructions Panel
    const instructions = document.createElement('div');
    instructions.id = 'instructions';

    if (isTouch) {
        instructions.innerHTML = `
            <div class="instruction-title">TOUCH CONTROLS</div>
            <div class="instruction-item"><span>JOYSTICK</span> Move</div>
            <div class="instruction-item"><span>DRAG SCREEN</span> Look</div>
            <div class="instruction-item"><span>BUTTONS</span> Jump / Build / Mine</div>
        `;
    } else {
        instructions.innerHTML = `
            <div class="instruction-title">CONTROLS</div>
            <div class="instruction-item"><span>WASD</span> Move</div>
            <div class="instruction-item"><span>SPACE</span> Jump</div>
            <div class="instruction-item"><span>LEFT CLICK</span> Mine / Remove</div>
            <div class="instruction-item"><span>RIGHT CLICK</span> Build / Place</div>
            <div class="instruction-item"><span>MOUSE</span> Look</div>
        `;
    }

    document.body.appendChild(instructions);

    // Click to Start Overlay
    const startOverlay = document.createElement('div');
    startOverlay.id = 'click-to-start';
    startOverlay.innerHTML = '<div>Click to Start</div>';
    document.body.appendChild(startOverlay);

    startOverlay.addEventListener('click', () => {
        startOverlay.remove();
    });
}
