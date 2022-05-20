import debounce from "./debounce.js";

export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    // objeto geral sempre com referencia os numeros, onde ta o slide,
    // quanto q moveu do mouse
    this.dist = {
      finalPosition: 0,
      // salvar a referencia de onde o mouse estava no inicio do click 'startX'
      startX: 0,
      // total q se moveu 'movement'
      movement: 0,
    };
    this.activeClass = "active";

    // evento q fala com as bolinhas e o slide assim q elas movem
    this.changeEvent = new Event("changeEvent");
  }

  // metódo pra fazer a transição do slide bunitinha, qnd começa ele fica falso
  // e quando termina ele vira true
  transition(active) {
    // se o active for true vai utilizar o transform .3s
    // e se não for, nao vai usar
    this.slide.style.transition = active ? "transform .3s" : "";
  }

  // metódo q vai mover o slide em si
  moveSlide(distX) {
    // movePosition pra salvar a posição em o slide de moveu referente ao distX
    // pra começar apartir dele
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  // 'updatePosition' é o calculo da diferença do click inicial pro click final
  updatePosition(clientX) {
    // para fazer com o slide deslize mais rápido
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }

  // 'clientX' - fornece as coordenadas horizontais dentro da área do aplicativo
  // do cliente em que o evento ocorreu (diferente das coordenadas dentro da página)

  // quando a pessoa clicou 'onStart'
  onStart(event) {
    let movetype;
    // se o evento for do tipo mousedown
    if (event.type === "mousedown") {
      event.preventDefault();
      this.dist.startX = event.clientX;
      movetype = "mousemove";
      // se for outro evento, no caso touch
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      movetype = "touchmove";
    }
    this.wrapper.addEventListener(movetype, this.onMove);
    this.transition(false);
  }

  // 'changedTouches' propriedade somente do touchEvent que possui uma lista de eventos
  // [0] indica que voce quer o primeiro touch, e ele tbm possui clientX

  // 'onMove' durante o movimento
  onMove(event) {
    // pointerPosition pode ser a posição inicial do dedo ou do mouse
    // se o evento for mousemove ? o valor dele vai ser clientx
    // : se não for o evento mousemove o valor dele vai ser de acordo com o changedTouches
    const pointerPosition =
      event.type === "mousemove"
        ? event.clientX
        : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  // acaba com o evendo qnd ele for desclidado 'mouseup'
  onEnd(event) {
    // movetype tipo de movimento pra remover o movimento
    // se o evento for do tipo 'mouseup' ? o movetype vai ser igual a 'mousemove'
    // se ñ for igual será 'touchmove'
    const movetype = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(movetype, this.onMove);
    // quando a pessoa tirou o mouse de cima tem q guardar o valor 'distX'
    this.dist.finalPosition = this.dist.movePosition;
    this.transition(true);
    this.changeSlideOnEnd();
  }

  // evento pra trocar os slides quando o atual estiver na metade pro fim
  // e centralizar o novo slide
  changeSlideOnEnd() {
    // quando o movimento for positivo e o proximo for diferente de undefined ele vai pro next e
    //qnd o movimento for negativo e diferente de undefined ele vai pro prev e
    // se for o primeiro ou o ultimo, centraliza o atual
    if (this.dist.movement > 120 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
      this.activePrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
  }

  // adiciona os eventos aos slides
  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }

  // Slides config
  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { position, element };
    });
  }

  // para saber qual é o proximo e o anterior
  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      // se o index existir e se não vai ser undefined,
      prev: index ? index - 1 : undefined,

      active: index,

      // se o index for igual a last (ultimo item), o valor vai ser undefined
      // e se não for vai ser index + 1
      next: index === last ? undefined : index + 1,
    };
  }

  // muda o slide de acordo com o index
  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    // tem q passar aqui pra poder atualizar assim q o slide mudar
    this.slidesIndexNav(index);
    this.dist.finalPosition = activeSlide.position;
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  // adicionar active ao elemento que esta ativo
  changeActiveClass() {
    this.slideArray.forEach((item) =>
      item.element.classList.remove(this.activeClass)
    );
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  // ativar o slide anterior
  activePrevSlide() {
    // so vai ativar o anterior se o index for diferente de undefined
    if (this.index.prev !== undefined) {
      this.changeSlide(this.index.prev);
    }
  }

  // ativar o próximo slide
  activeNextSlide() {
    if (this.index.next !== undefined) {
      this.changeSlide(this.index.next);
    }
  }

  // metodo para ajustar as imagens ao tamanho da tela
  onResize() {
    // espera um tempo para ativar o resize da imagem
    setTimeout(() => {
      this.slidesConfig();
      // vai reposicionar o slide q estiver ativo
      this.changeSlide(this.index.active);
    }, 1000);
  }

  addResizeEvent() {
    window.addEventListener("resize", this.onResize);
  }

  // referencia ao objeto Slide
  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);

    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);

    this.onResize = debounce(this.onResize.bind(this), 200);
  }

  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvents();
    this.slidesConfig();
    this.addResizeEvent();
    this.changeSlide(0);
    return this;
  }
}

// adicionar evento a navegação por setas/buttons
export default class SlideNav extends Slide {
  constructor(slide, wrapper) {
    super(slide, wrapper);
    this.bindControlEvents();
  }

  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvent();
  }

  addArrowEvent() {
    this.prevElement.addEventListener("click", this.activePrevSlide);
    this.nextElement.addEventListener("click", this.activeNextSlide);
  }

  // paginação
  createControl() {
    const control = document.createElement("ul");
    control.dataset.control = "slide";
    this.slideArray.forEach((item, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${
        index + 1
      }</a></li>`;
    });
    // adiciona o controle ao elemento
    this.wrapper.appendChild(control);
    return control;
  }

  // adicionar evento as bolinhas e os items
  eventControl(item, index) {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      this.changeSlide(index);
    });
    this.wrapper.addEventListener("changeEvent", this.activeControlItem);
  }

  // adiciona a classe ativa(bolinha vermelha) ao slide(referencia) e bolinha q estão ativas
  activeControlItem() {
    this.controlArray.forEach((item) =>
      item.classList.remove(this.activeClass)
    );
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

  // função que adiciona os eventos de eventControl
  addControl(customControl) {
    this.control =
      document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];
    this.activeControlItem();
    this.controlArray.forEach(this.eventControl);
  }

  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
