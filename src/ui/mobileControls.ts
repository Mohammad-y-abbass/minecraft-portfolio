import { Player } from "../player/player";

export function setupMobileControls(player: Player) {
    if (!player.isTouchDevice) return;

    // Joystick Container
    const joystickContainer = document.createElement('div');
    joystickContainer.id = 'joystick-container';
    document.body.appendChild(joystickContainer);

    const joystick = document.createElement('div');
    joystick.id = 'joystick';
    joystickContainer.appendChild(joystick);

    // Buttons Container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'mobile-buttons';
    document.body.appendChild(buttonsContainer);

    const createButton = (id: string, label: string, callback: () => void) => {
        const btn = document.createElement('div');
        btn.id = id;
        btn.className = 'mobile-btn';
        btn.innerHTML = label;
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            callback();
        });
        buttonsContainer.appendChild(btn);
        return btn;
    };

    createButton('jump-btn', 'JUMP', () => {
        if (player.onGround) {
            player.velocity.y = player.jumpForce;
            player.onGround = false;
        }
    });

    createButton('mine-btn', 'MINE', () => {
        const event = new MouseEvent('mousedown', { button: 0 });
        player.onMouseDown(event);
    });

    createButton('build-btn', 'BUILD', () => {
        const event = new MouseEvent('mousedown', { button: 2 });
        player.onMouseDown(event);
    });

    // Touch Tracking
    let joystickTouchId: number | null = null;
    let lookTouchId: number | null = null;
    let lastLookX: number | null = null;
    let lastLookY: number | null = null;
    const maxDistance = 40;

    joystickContainer.addEventListener('touchstart', (e) => {
        if (joystickTouchId !== null) return;
        const touch = e.changedTouches[0];
        joystickTouchId = touch.identifier;
        e.stopPropagation();
    });

    window.addEventListener('touchstart', (e) => {
        // Find the first touch that isn't the joystick and isn't already looking
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier !== joystickTouchId && lookTouchId === null) {
                // If it's not starting on a mobile button (those stop propagation)
                if (!(touch.target as HTMLElement).classList.contains('mobile-btn')) {
                    lookTouchId = touch.identifier;
                    lastLookX = touch.clientX;
                    lastLookY = touch.clientY;
                }
            }
        }
    });

    const updateMovement = (touch: Touch) => {
        const rect = joystickContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
        const angle = Math.atan2(dy, dx);

        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        joystick.style.transform = `translate(${tx}px, ${ty}px)`;

        const deadzone = 10;
        player.moveForward = ty < -deadzone;
        player.moveBackward = ty > deadzone;
        player.moveLeft = tx < -deadzone;
        player.moveRight = tx > deadzone;
    };

    window.addEventListener('touchmove', (e: TouchEvent) => {
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];

            if (touch.identifier === joystickTouchId) {
                updateMovement(touch);
            } else if (touch.identifier === lookTouchId) {
                const movementX = touch.clientX - (lastLookX ?? touch.clientX);
                const movementY = touch.clientY - (lastLookY ?? touch.clientY);

                player.rotationY -= movementX * player.lookSensitivity;
                player.rotationX -= movementY * player.lookSensitivity;
                player.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.rotationX));

                lastLookX = touch.clientX;
                lastLookY = touch.clientY;
            }
        }
    }, { passive: false });

    const handleTouchEnd = (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === joystickTouchId) {
                joystickTouchId = null;
                joystick.style.transform = `translate(0px, 0px)`;
                player.moveForward = false;
                player.moveBackward = false;
                player.moveLeft = false;
                player.moveRight = false;
            } else if (touch.identifier === lookTouchId) {
                lookTouchId = null;
                lastLookX = null;
                lastLookY = null;
            }
        }
    };

    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
}
