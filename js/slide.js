export default class Slide {
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
  }

  // adiciona os eventos aos slides
  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }

  // referencia ao objeto Slide
  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
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
    console.log(last);
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
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    this.slidesConfig();
    return this;
  }
}
