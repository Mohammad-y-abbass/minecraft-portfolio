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

    // Joystick Logic
    let isDraggingJoystick = false;
    const maxDistance = 40;

    joystickContainer.addEventListener('touchstart', () => {
        isDraggingJoystick = true;
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

        // Update player movement flags
        const deadzone = 10;
        player.moveForward = ty < -deadzone;
        player.moveBackward = ty > deadzone;
        player.moveLeft = tx < -deadzone;
        player.moveRight = tx > deadzone;
    };

    window.addEventListener('touchmove', (e) => {
        if (isDraggingJoystick) {
            updateMovement(e.touches[0]);
        } else {
            // Drag to look logic
            const touch = e.touches[0];
            const movementX = touch.clientX - (window as any).lastTouchX || 0;
            const movementY = touch.clientY - (window as any).lastTouchY || 0;

            player.rotationY -= movementX * player.lookSensitivity;
            player.rotationX -= movementY * player.lookSensitivity;
            player.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.rotationX));

            (window as any).lastTouchX = touch.clientX;
            (window as any).lastTouchY = touch.clientY;
        }
    }, { passive: false });

    window.addEventListener('touchend', () => {
        if (isDraggingJoystick) {
            isDraggingJoystick = false;
            joystick.style.transform = `translate(0px, 0px)`;
            player.moveForward = false;
            player.moveBackward = false;
            player.moveLeft = false;
            player.moveRight = false;
        }
        (window as any).lastTouchX = null;
        (window as any).lastTouchY = null;
    });
}
