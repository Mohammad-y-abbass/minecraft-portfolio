export class ContentManager {
    element: HTMLElement;
    titleElement: HTMLElement;
    bodyElement: HTMLElement;
    isVisible: boolean = false;
    currentSection: string | null = null;

    constructor() {
        this.element = document.createElement('div');
        this.element.id = 'content-overlay';
        this.element.innerHTML = `
            <div class="content-card">
                <button class="close-btn">×</button>
                <h1 class="content-title"></h1>
                <div class="content-body"></div>
            </div>
        `;
        document.body.appendChild(this.element);

        this.titleElement = this.element.querySelector('.content-title') as HTMLElement;
        this.bodyElement = this.element.querySelector('.content-body') as HTMLElement;

        const closeBtn = this.element.querySelector('.close-btn') as HTMLElement;
        closeBtn.onclick = () => this.hide();

        this.hide();
    }

    show(title: string, body: string, sectionId: string) {
        if (this.currentSection === sectionId) return;

        this.titleElement.innerText = title;
        this.bodyElement.innerText = body;
        this.element.style.display = 'flex';
        this.isVisible = true;
        this.currentSection = sectionId;

        // Briefly fade in
        setTimeout(() => {
            this.element.style.opacity = '1';
        }, 10);
    }

    hide() {
        this.element.style.opacity = '0';
        this.isVisible = false;
        this.currentSection = null;
        setTimeout(() => {
            if (!this.isVisible) {
                this.element.style.display = 'none';
            }
        }, 300);
    }
}
