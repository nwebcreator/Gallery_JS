const GalleryClassName = 'gallery';
const GalleryLineClassName = 'gallery-line';
const GallerySlideClassName = 'gallery-slide';

class Gallery {
    constructor(element, options = {}) {
        this.containerNode = element;
        this.size = element.childElementCount;
        this.currentSlide = 0;


        this.manageHTML = this.manageHTML.bind(this); // чтобы при вызове методов не слетали контексты, например если методы вызываются в событиях - переопределяем метод и добавляем bind(this), тем самым методы всегда будут точно вызываться с контекстом this
        this.setParameters = this.setParameters.bind(this);
        this.setEvents = this.setEvents.bind(this);
        this.resizeGallery = this.resizeGallery.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.dragging = this.dragging.bind(this);
        this.setStylePosition = this.setStylePosition.bind(this);

        this.manageHTML();
        this.setParameters();
        this.setEvents();
    }

    manageHTML() {
        this.containerNode.classList.add(GalleryClassName);
        this.containerNode.innerHTML = `
        <div class="${GalleryLineClassName}">
            ${this.containerNode.innerHTML}
        </div>
        `;
        this.lineNode = this.containerNode.querySelector(`.${GalleryLineClassName}`);

        this.slideNodes = Array.from(this.lineNode.children).map((childNode) =>
            wrapElementByDiv({
                element: childNode,
                className: GallerySlideClassName,
            })
        );
    }

    setParameters() {
        const coordsContainer = this.containerNode.getBoundingClientRect();
        this.width = coordsContainer.width;

        this.lineNode.style.width = `${this.size * this.width}px`;
        Array.from(this.slideNodes).forEach((slideNode) => {
            slideNode.style.width =`${this.width}px`;
        });
    }

    setEvents() {
        this.debounceResizeGallery = debounce(this.resizeGallery);
        window.addEventListener('resize', this.debounceResizeGallery);
        this.lineNode.addEventListener('pointerdown', this.startDrag);
        window.addEventListener('pointerup', this.stopDrag);
    }

    destroyEvents() {
        window.removeEventListener('resize', this.debounceResizeGallery);
    }

    resizeGallery() {
        this.setParameters(); // нужно пересчитать ширину основного контейнера и ширину слайдов
    }

    startDrag() {
        this.clickX = evt.pageX;
        window.addEventListener('pointermove', this.dragging);
    }

    stopDrag() {
        window.removeEventListener('pointermove', this.dragging);
    }

    dragging(evt) {
        this.dragX = evt.pageX;
        const dragShift = this.dragX - this.clickX;
        this.setStylePosition(dragShift);
    }

    setStylePosition(shift) {
        this.lineNode.style.transform = `translate3d(${shift}px, 0, 0)`;
    }
}

//Helpers
function wrapElementByDiv({element, className}) {
    const wrapperNode = document.createElement('div');
    wrapperNode.classList.add(className);

    element.parentNode.insertBefore(wrapperNode, element);
    wrapperNode.appendChild(element);

    return wrapperNode;
}

function debounce(func, time = 100) {
    let timer;
    return function (event) {
        clearTimeout(timer);
        timer = setTimeout(func, time, event);
    }
}