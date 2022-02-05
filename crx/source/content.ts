import { mount } from './Wordler';

const mountElement = document.createElement('div');
mountElement.id = 'wordler';
document.body.appendChild(mountElement);

mount(mountElement);