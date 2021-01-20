/* global document, customElements, HTMLElement */

const createElement = ({ x, y, fill, width, height, label: text }) => {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

  rect.setAttribute('fill', fill)
  rect.setAttribute('width', width)
  rect.setAttribute('height', height)
  rect.setAttribute('x', x)
  rect.setAttribute('y', y)

  if (text) {
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    label.setAttribute('fill', '#000')
    label.setAttribute('font-family', 'Arial')
    label.setAttribute('font-size', '10')
    label.setAttribute('x', x + 200)
    label.setAttribute('y', y - 50)
    label.textContent = text

    // <line x1="10" y1="10" x2="90" y2="90" stroke-width="1" stroke="black"/>
    const connection = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    connection.setAttribute('stroke', '#000')
    connection.setAttribute('x1', x + 12)
    connection.setAttribute('y1', y + 12)
    connection.setAttribute('x2', x + 200)
    connection.setAttribute('y2', y - 50)
    group.appendChild(connection)
    group.appendChild(label)
  }
  group.appendChild(rect)

  return group
}

const OBJECT_COUNT = 500
const ANIMATION_DURATION = 30000

let start

// just a stupid implementation to move around things.
// NOTE: The interesting part is the use of requestAnimationFrame,
//       to leverage the underlying browser animation slots.
const updateElementPositions = (svg, elements, boundary = {}) => {
  const step = (iteration = 1) => (timestamp) => {
    if (start === undefined) { start = timestamp }
    const elapsed = timestamp - start

    elements.forEach((element, i) => {
    // `Math.min()` is used here to make sure that the element stops at exactly 200px.
      const newX = (i * 10 + iteration) % boundary.width
      const newY = (Math.pow(i, 2) + iteration) % boundary.height

      element.style.transform = `translate(${newX}px, ${newY}px)`

      if (!element.trace || Math.abs(element.trace.x - newX) > 10 || Math.abs(element.trace.y - newY) > 10) {
        element.trace = { x: newX, y: newY }
        element.traces = element.traces || []
        const trace = createElement({ x: newX, y: newY, width: 2, height: 2, fill: 'black' })
        element.traces.push(trace)
        if (element.traces.length > 5) {
          const oldestTrace = element.traces.shift()
          oldestTrace.remove()
        }
        svg.appendChild(trace)
      }
    })

    if (elapsed < ANIMATION_DURATION) { // Stop the animation after ANIMATION_DURATION milliseconds
      window.requestAnimationFrame(step(++iteration))
    }
  }

  return step()
}

class MovableParts extends HTMLElement {
  connectedCallback () {
    this.svg = this.querySelector('svg')
    const { width, height } = this.svg.viewBox.baseVal

    this.elements = []
    for (let i = 0; i < OBJECT_COUNT; i++) {
      this.elements.push(this.appendElement({
        fill: i % 2 === 0 ? '#acacac' : 'red',
        width: '25',
        height: '25',
        x: 10 + i * 2,
        y: 10 + i * 2,
        label: Math.random().toString(36).substring(2, 15)
      }))
    }

    window.requestAnimationFrame(updateElementPositions(this.svg, this.elements, { width, height }))
  }

  appendElement ({ x, y, fill, width, height, label }) {
    const el = createElement({ x, y, fill, width, height, label })
    this.svg.appendChild(el)
    return el
  }
}

customElements.define('movable-parts', MovableParts)
