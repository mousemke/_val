/**
 * initializes and attaches the chat window
 */
function chatWindowSetup(fetchUrl, suppliedUser) {
  const wrapper = document.createElement('div');
  const content = document.createElement('div');
  const inputWrapper = document.createElement('div');
  const inputButton = document.createElement('button');
  const inputLabel = document.createElement('label');
  const input = document.createElement('input');
  const styles = document.createElement('style');

  /**
   *  addCss
   */
  function addCss() {
    const css = `
      .chat__hidden {
          position: absolute;
          left: 9999999px;
          opacity: 0;
      }

      .chat__wrapper {
          position: fixed;
          bottom: 0;
          right: 15px;
          height: 400px;
          width: 275px;
          border: #ff8c00 solid 1px;
          background-color: #fff;
      }

      .chat__content {
          padding: 10px;
          max-height: calc( 100% - 40px );
          font-family: monospace;
          font-size: 10px;
          overflow-y: scroll;
      }

      .chat__val, .chat__user {
          width: 30px;
          display: inline-block;
          color: #00a1e4;
      }

      .chat__user {
          color: #00a100;
      }

      .chat__input-wrapper {
          position: absolute;
          bottom: 2px;
          left: 2px;
          width: calc( 100% - 4px );
      }

      .chat__input {
          width: calc( 100% - 65px );
          text-indent: 5px;
      }

      .chat__input-button {
          width: 55px;
          margin-left: 4px;
      }`;

    styles.innerHTML = css;
    document.head.appendChild( styles );
  }

  function addResponse(user, res) {
    const userClass = user === 'Val' ? 'val' : 'user';
    const text = res.text ? res.text : res;

    const response = document.createElement('div');
    response.innerHTML = `<span class="chat__${userClass}">${user}:</span>
                            </span class="chat__response">${text}</span>`;
    content.appendChild(response);
  }

  /**
   * ## buildWindow
   */
  function buildWindow() {
    wrapper.classList.add('chat__wrapper');
    content.classList.add('chat__content');
    inputWrapper.classList.add('chat__input-wrapper');
    inputButton.classList.add('chat__input-button');
    inputLabel.classList.add('chat__hidden');
    input.classList.add('chat__input');

    inputLabel.textContent = 'How can I help?'
    input.setAttribute('placeholder', 'How can I help?');
    inputButton.textContent = 'Submit';

    wrapper.appendChild(content);
    inputWrapper.appendChild(inputLabel);
    inputWrapper.appendChild(input);
    inputWrapper.appendChild(inputButton);
    wrapper.appendChild(inputWrapper);

    document.body.appendChild(wrapper);
  }


  function bindEvents() {
    input.addEventListener('keydown', checkEnter);
    inputButton.addEventListener('click', submit);
  }


  function checkEnter(e) {
    if (e.key === 'Enter') {
      submit();
    }
  }


  function submit(user = suppliedUser) {
    const value = input.value;

    if (value !== '') {
      input.value = '';

      addResponse(user, value);

      fetch(`${fetchUrl}${value}`)
        .then(r => r.json())
        .then(data => {
            if (data.status === '200' && data.text && data.text !== '') {
              addResponse( 'Val', data.text );
            }
        });
    }
  }

  buildWindow();
  addResponse('Val', 'How can I help you today?');
  addCss();
  bindEvents();
  input.focus();
}
