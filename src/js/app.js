import { isWebp } from './modules/isWebp.js';
import { products } from './products.js';
import { gsap } from 'gsap';

isWebp();

const MIN_TABLET_WIDTH = 576;
const MIN_DESKTOP_WIDTH = 992;
const screenTypes = {
  mobile: 'mobile',
  tablet: 'tablet',
  desktop: 'desktop'
};

const body = document.body;
const burger = body.querySelector('.header__burger');
const menu = body.querySelector('.page__menu');
const menuNav = menu.querySelector('#menu-nav');
const tabs = body.querySelector('.tabs');
const tabsCollection = body.querySelectorAll('.tabs__tab');
let selectedTab = tabs.querySelector('.tabs__tab--selected');
const selectedTabWidth = selectedTab.clientWidth;
const line = tabs.querySelector('.tabs__line');
const productsList = body.querySelector('.shop__products');
const shopButton = body.querySelector('.shop__button');
const shopButtonText = shopButton.querySelector('.button__text');
const form = body.querySelector('form');
const userNameField = form.querySelector('[name="username"]');
const emailField = form.querySelector('[name="email"]');
const phoneField = form.querySelector('[name="tel"]');
const textarea = form.querySelector('#autoResizeTextarea');
const animImages = body.querySelectorAll('.anim--image');
const animTexts = body.querySelectorAll('.anim--text');
const animButtons = body.querySelectorAll('.anim--button');

let menuIsOpen = false;
let screenType = screenTypes.mobile;
let visibleProductsCount = 1;
let selectedCategory = 'face';
let productsAreHidden = true;
let nameError = true;
let emailError = true;
let phoneError = true;

const openMenu = () => {
  menuIsOpen = true;
  burger.classList.add('header__burger--active');
  menu.classList.add('page__menu--active');
  body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
};

const closeMenu = () => {
  menuIsOpen = false;
  burger.classList.remove('header__burger--active');
  menu.classList.remove('page__menu--active');
  body.style.overflow = '';
  document.documentElement.style.overflow = '';
};

const setLineWidth = (width) => {
  line.style.width = `${width}px`;
};

const setLineWidthAndLeft = (width, left) => {
  setLineWidth(width)
  const tabsLeft = tabs.getBoundingClientRect().left;

  line.style.left = `${left - tabsLeft}px`;
};

const setVisibleProductCount = () => {
  visibleProductsCount = screenType === screenTypes.mobile
    ? 1
    : 2;
}

const renderProducts = () => {
  const filteredProducts = products.filter(product => product.type === selectedCategory);
  const visibleProducts = productsAreHidden
    ? filteredProducts.slice(0, visibleProductsCount)
    : filteredProducts;

  productsList.innerHTML = '';

  visibleProducts.forEach(({ imgUrl, name, price }) => {
    productsList.insertAdjacentHTML('afterbegin', `
    <li class="product-card">
      <img src="${imgUrl}" class="product-card__image">

      <h3 class="product-card__title">
        ${name}
      </h3>

      <p class="product-card__price">
        ${price} UAH
      </p>
    </li>
    `)
  })
};

const validateEmail = (email) => {
  const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return re.test(email);
};

const validateName = (name) => {
  const re = /^[a-zA-Z][\w -]{0,28}[a-zA-Z0-9]$/;

  return re.test(name);
};

const validatePhoneNumber = (phoneNumber) => {
  const cleanedPhoneNumber = phoneNumber.replace(/\s/g, "");
  const re = /^(0\d{9}|80\d{9}|\+380\d{9})$/;

  return re.test(cleanedPhoneNumber);
};

const setScreenType = () => {
  const screenWidth = screen.width;

  if (screenWidth < MIN_TABLET_WIDTH && screenType !== screenTypes.mobile) {
    screenType = screenTypes.mobile;
    setVisibleProductCount();
    renderProducts();
  }

  if (screenWidth >= MIN_TABLET_WIDTH && screenWidth < MIN_DESKTOP_WIDTH && screenType !== screenTypes.tablet) {
    screenType = screenTypes.tablet;
    setVisibleProductCount();
    renderProducts();
  }

  if (screenWidth >= MIN_DESKTOP_WIDTH && screenType !== screenTypes.desktop) {
    screenType = screenTypes.desktop;
    setVisibleProductCount();
    renderProducts();
  }
};

const createObserver = (options) => {
  return new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const { target } = entry;

        gsap.to(target, {
          opacity: 1,
          duration: 0.5,
          ...options,
        });

        observer.unobserve(target);
      };
    });
  }, {
    rootMargin: '50px',
  });
};

setScreenType();
setLineWidth(selectedTabWidth);

window.addEventListener('resize', () => {
  setScreenType();

  setLineWidthAndLeft(selectedTab.clientWidth, selectedTab.getBoundingClientRect().left);
})

burger.addEventListener('click', () => {
  if (menuIsOpen) {
    closeMenu();
    return;
  }

  openMenu();
})

menuNav.addEventListener('click', e => {
  const menuLink = e.target.closest('.menu__link');

  if (!menuLink) {
    return;
  };

  closeMenu();
})

tabs.addEventListener('click', (e) => {
  const currentTab = e.target.closest('.tabs__tab');

  if (!currentTab) {
    return;
  }

  selectedTab = currentTab;
  selectedCategory = e.target.textContent.trim();
  renderProducts();

  const currentTabWidth = currentTab.offsetWidth;
  const tabLeft = currentTab.getBoundingClientRect().left;
  setLineWidthAndLeft(currentTabWidth, tabLeft);

  tabsCollection.forEach(tab => {
    if (tab === currentTab) {
      tab.classList.add('tabs__tab--selected');
    } else {
      tab.classList.remove('tabs__tab--selected');
    }
  })
});

shopButton.addEventListener('click', () => {
  productsAreHidden = !productsAreHidden;
  renderProducts();

  shopButtonText.textContent = productsAreHidden
    ? 'all products'
    : 'hide products';
});

form.addEventListener('submit', e => {
  e.preventDefault();

  if (nameError || emailError || phoneError) {
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());

  console.log(data);

  userNameField.value = '';
  userNameField.classList.remove('help__input--success');
  nameError = true;
  emailField.value = '';
  emailField.classList.remove('help__input--success');
  emailError = true;
  phoneField.value = '';
  phoneField.classList.remove('help__input--success');
  phoneError = true;
  textarea.value = '';
});

userNameField.addEventListener('blur', (e) => {
  if (validateName(e.target.value.trim())) {
    userNameField.classList.add('help__input--success');
    return;
  }

  nameError = true;
  userNameField.classList.add('help__input--error');
});

userNameField.addEventListener('input', (e) => {
  if (nameError && validateName(e.target.value.trim())) {
    nameError = false;
    userNameField.classList.remove('help__input--error');
    userNameField.classList.add('help__input--success');
  }
});

emailField.addEventListener('blur', (e) => {
  if (validateEmail(e.target.value.trim())) {
    emailField.classList.add('help__input--success');
    return;
  }

  emailError = true;
  emailField.classList.add('help__input--error');
});

emailField.addEventListener('input', (e) => {
  if (emailError && validateEmail(e.target.value.trim())) {
    emailError = false;
    emailField.classList.remove('help__input--error');
    emailField.classList.add('help__input--success');
  }
});

phoneField.addEventListener('blur', (e) => {
  if (validatePhoneNumber(e.target.value.trim())) {
    phoneField.classList.add('help__input--success');
    return;
  }

  phoneError = true;
  phoneField.classList.add('help__input--error');
});

phoneField.addEventListener('input', (e) => {
  const value = e.target.value.trim();

  if (phoneError && validatePhoneNumber(value)) {
    phoneError = false;
    phoneField.classList.remove('help__input--error');
    phoneField.classList.add('help__input--success');
  }
});

textarea.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

const imagesObserver = createObserver({ scale: 1 });
const textsObserver = createObserver({ y: 0 });
const buttonsObserver = createObserver({ x: 0 });

animImages.forEach(animImage => imagesObserver.observe(animImage));
animTexts.forEach(animText => textsObserver.observe(animText));
animButtons.forEach(animButton => buttonsObserver.observe(animButton));
