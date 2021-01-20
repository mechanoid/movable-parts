/* global document, customElements, HTMLElement */

const createElement = ({ x, y, fill, width, height }) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  el.setAttribute('fill', fill)
  el.setAttribute('width', width)
  el.setAttribute('height', height)
  el.setAttribute('x', x)
  el.setAttribute('y', y)
  return el
}

const OBJECT_COUNT = 10000
const ANIMATION_DURATION = 30000

let start

// just a stupid implementation to move around things.
// NOTE: The interesting part is the use of requestAnimationFrame,
//       to leverage the underlying browser animation slots.
const updateElementPositions = (elements, boundary = {}) => {
  const step = (timestamp) => {
    if (start === undefined) { start = timestamp }
    const elapsed = timestamp - start

    elements.forEach((element, i) => {
    // `Math.min()` is used here to make sure that the element stops at exactly 200px.
      const newX = parseInt(Math.sin(10 * elapsed) + elapsed / 100)
      let newY = Math.pow(i * elapsed / 1000, 2) + elapsed / 100

      if (newY > boundary.height) {
        newY = newY - Math.pow(i * elapsed / 1000, 2) - elapsed / 100
      }

      element.style.transform = `translate(${newX}px, ${newY}px)`
    })

    if (elapsed < ANIMATION_DURATION) { // Stop the animation after ANIMATION_DURATION milliseconds
      window.requestAnimationFrame(step)
    }
  }

  return step
}

class MovableParts extends HTMLElement {
  connectedCallback () {
    this.svg = this.querySelector('svg')
    const boundary = this.svg.getBoundingClientRect()

    this.elements = []
    for (let i = 0; i < OBJECT_COUNT; i++) {
      this.elements.push(this.appendElement({ fill: i % 2 === 0 ? '#acacac' : 'red', width: '25', height: '25', x: 10 + i * 2, y: 10 + i * 2 }))
    }

    window.requestAnimationFrame(updateElementPositions(this.elements, boundary))
  }

  appendElement ({ x, y, fill, width, height }) {
    const el = createElement({ x, y, fill, width, height })
    this.svg.appendChild(el)
    return el
  }
}

customElements.define('movable-parts', MovableParts)
