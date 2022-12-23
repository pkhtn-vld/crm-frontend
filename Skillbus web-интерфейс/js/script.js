const SERVER_URL = 'http://localhost:3000/';
const API = 'api/clients';
// создаём список студентов  из API
const createStudentList = async () => {
  const response = await fetch(`${SERVER_URL}${API}`);
  const data = await response.json();

  tbody.classList.add("clients__table-tbody");
  table.appendChild(tbody);
  let dataCopy = JSON.parse(JSON.stringify(data));

  createFio(dataCopy, fio);
  filterStudents(dataCopy);
  sortStudent(dataCopy, columnDir)
  inputValidate();
  addClientBtnEvent();

  /// модальное окно Добавить нового студента ///
  addContactEvents();
  validateInputOnline();
  addSaveBtnEvents();

  /// изменяем данные студента  ///
  addBtnContactEditEvents();
  clearModalInputs();
  validateInputOnlineEdit();
  addSaveBtnEditEvents()

  // сортируем по ID при запуске
  tableId.click();
};
// удаляем студента из API
const deleteStudent = async (id) => {
  const response = await fetch(`${SERVER_URL}${API}/${id}`, {
    method: "DELETE",
  })
  if (response.status === 404) console.log("Что-то пошло не так...")
  location.hash = "";
}
// изменяем данные студента в API
const changeStudentItem = async (id, bodyJSONRequest) => {
  const response = await fetch(`${SERVER_URL}${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(bodyJSONRequest),
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (response.status === 404) console.log("Что-то пошло не так...")

  if (response.status === 422) {
    //выводим сообщение об ошибке при пустом запросе
    errorEmptyEdit.classList.add("is-active")
    addBtnContainer.style.marginBottom = "0px"
  }
  location.hash = "";
}
// создаём нового студента в API
const createStudentItem = async () => {
  const response = await fetch(`${SERVER_URL}${API}`, {
    method: "POST",
    body: JSON.stringify(bodyJSONRequest),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status === 422) {
    // выводим сообщение об ошибке при пустом запросе
    errorEmpty.classList.add("is-active");
    addBtnContainer.style.marginBottom = "0px";
  }
  location.hash = "";
};
// заполняем таблицу студентов
const fillTable = (data) => {
  for (key in data) {
    let row = document.createElement("tr");

    // добавляются id, ФИО, Дата создания, Дата посл. изменения
    row.innerHTML = fillTableHeader(
      data[key].id,
      data[key].surname,
      data[key].name,
      data[key].lastName,
      data[key].createdAt,
      data[key].updatedAt
    );

     // добавление option для фильтрации
    listForAutocomplete.innerHTML += `<option value="${ data[key].surname + " " + data[key].name + " " + data[key].lastName }">`

    // добавляются контакты студента
    const contacts = document.createElement("td");
    contacts.classList.add("clients__table-contacts-content");
    row.append(contacts);
    addStudentContacts(data[key].contacts, contacts);

    // добавляются кнопки Изменить и Удалить
    row.innerHTML += rowInnerHtml;
    tbody.appendChild(row);
  }
}
// очищение инпутов после добавления нового студента
const addClientBtnEvent = () => {
  addClientBtn.addEventListener('click', () => {
    newStudentName.value = '';
    newStudentSurname.value = '';
    newStudentLastName.value = '';
  })
};
// создаются кнопки, раскрывающие контакты в таблице, когда их больше 4х
const openContactsBtn = () => {
  const contactsContainner = document.querySelectorAll(".clients__table-contacts-content");
  contactsContainner.forEach((el) => {
    if (el.children.length > 4) {
      el.innerHTML += `<button class="clients__table-contacts-content-btn">+${el.children.length - 4}<button>`;
      for (let i = 4; i < el.children.length; i++) {
        el.children[i].style.display = "none";
      }

      // настраиваются события нажатия этих кнопок
      let showBtns = document.querySelectorAll(
        ".clients__table-contacts-content-btn"
      );
      showBtns.forEach((elem) => {
        elem.style.display = "inline-block";
        elem.addEventListener("click", (e) => {
          e.preventDefault();

          for (let i = 0; i < e.target.parentElement.children.length; i++) {

            if (e.target.parentElement.children[i].tagName !== "BUTTON") {
              e.target.parentElement.children[i].style.display = "inline-block";

            } else {
              e.target.parentElement.children[i].style.display = "none";
            }
          }
        });
      });
    }
  });
};
// валидация инпутов (ввод только русских букв, запрет на первый символ ' ' или '-')
const inputValidate = () => {
  let inputValidate = document.querySelectorAll(".input-validate");

  inputValidate.forEach((el) => {
    el.onkeydown = (e) => {
      return !/^[0-9=!"№;%:?*,_\'\\|\{\}\[\]()<>/+@#$%^&.`~A-Za-z]$/.test(
        e.key
      ); // IE > 9
    };
    el.oninput = () => {
      if (el.value.charAt(0) === " " || el.value.charAt(0) === "-") {
        el.value = "";
      }
    };
  });
  //отключаем клавишу Enter
  headerInput.addEventListener("keydown", (e) => {
      if (
        e.keyIdentifier == "U+000A" ||
        e.keyIdentifier == "Enter" ||
        e.keyCode == 13
      ) {
        if (e.target.nodeName == "INPUT" && e.target.type == "text") {
          e.preventDefault();
          return false;
        }
      }
    },
    true
  );
};
// сортируется объект (универсальная)
const sortObject = (arr, prop, dir = false) => arr.sort((a,b) => (!dir ? a[prop] < b[prop] : a[prop] > b[prop]) ? -1 : 1);
// сортируем студентов
const sortStudent = (dataCopy, columnDir) => {
  filterResult = filterObject(dataCopy, "fio", headerInput.value);
  const studentListTHALL = tableHeading.querySelectorAll('th')
  studentListTHALL.forEach(e => {
    e.addEventListener("click", () => {
      tbody.innerHTML = "";
      listForAutocomplete.innerHTML = '';
      const tableName = document.querySelector(".clients__table-name");
      const tableNameSort = document.querySelector(".clients__table-name-sort");
      const tableCreateAt = document.querySelector(".clients__table-createat");
      const tableUpdateAt = document.querySelector(".clients__table-updateat");

      // поворот стрелочек и цвет заголовков для TH
      if (e === tableId) {
        tableName.classList.remove("sort-text");
        tableCreateAt.classList.remove("sort-text");
        tableUpdateAt.classList.remove("sort-text");
        tableNameSort.classList.remove("opacity-1");
        tableName.children[1].classList.remove("arrow-flips");
        tableCreateAt.children[1].classList.remove("arrow-flips");
        tableUpdateAt.children[1].classList.remove("arrow-flips");
        columnDir = false;

        if (e.children[0].classList.contains("arrow-flips")) columnDir = true;
        e.children[0].classList.toggle("arrow-flips");
        e.children[0].classList.add("opacity-1");
        e.classList.add("sort-text");

      } else if (e === tableName) {
        tableId.classList.remove("sort-text");
        tableCreateAt.classList.remove("sort-text");
        tableUpdateAt.classList.remove("sort-text");
        tableId.children[0].classList.remove("arrow-flips");
        tableCreateAt.children[1].classList.remove("arrow-flips");
        tableUpdateAt.children[1].classList.remove("arrow-flips");
        columnDir = false;

        if (e.children[1].classList.contains("arrow-flips")) columnDir = true;
        e.children[1].classList.toggle("arrow-flips");
        e.children[1].classList.add("opacity-1");
        e.classList.add("sort-text");
        tableNameSort.classList.add("opacity-1");

      } else if (e === tableCreateAt) {
        tableId.classList.remove("sort-text");
        tableName.classList.remove("sort-text");
        tableUpdateAt.classList.remove("sort-text");
        tableNameSort.classList.remove("opacity-1");
        tableId.children[0].classList.remove("arrow-flips");
        tableName.children[1].classList.remove("arrow-flips");
        tableUpdateAt.children[1].classList.remove("arrow-flips");
        columnDir = false;

        if (e.children[1].classList.contains("arrow-flips")) columnDir = true;
        e.children[1].classList.toggle("arrow-flips");
        e.children[1].classList.add("opacity-1");
        e.classList.add("sort-text");

      } else if (e === tableUpdateAt) {
        tableId.classList.remove("sort-text");
        tableName.classList.remove("sort-text");
        tableCreateAt.classList.remove("sort-text");
        tableNameSort.classList.remove("opacity-1");
        tableId.children[0].classList.remove("arrow-flips");
        tableName.children[1].classList.remove("arrow-flips");
        tableCreateAt.children[1].classList.remove("arrow-flips");
        columnDir = false;

        if (e.children[1].classList.contains("arrow-flips")) columnDir = true;
        e.children[1].classList.toggle("arrow-flips");
        e.children[1].classList.add("opacity-1");
        e.classList.add("sort-text");
      }

      //сортируем студентов
      const type = e.getAttribute("data-type");
      sortObject(filterResult, type, columnDir);

      //переписываем таблицу
      fillTable(filterResult);
      openContactsBtn();
      fillModalEdit(
        filterResult,
        addBtnContactEdit,
        contactBlocks,
        contactsContainerEdit,
        addBtnContainerEdit
      );
      deleteStudentFromTable();
      deleteStudentFromModal();
      //добавляем карточку студента при клике на ФИО
      addStudentCard(filterResult);
    });
  })
}
// фильтрация студентов
const filterStudents = (dataCopy) => {
  headerInput.addEventListener("keyup", (e) => {
    if (e.keyCode !== 38 && e.keyCode !== 40) {
      setTimeout(() => {
        filterResult = filterObject(dataCopy, "fio", headerInput.value);
        tbody.innerHTML = "";
        listForAutocomplete.innerHTML = "";
        fillTable(filterResult);
        openContactsBtn();
        fillModalEdit(
          filterResult,
          addBtnContactEdit,
          contactBlocks,
          contactsContainerEdit,
          addBtnContainerEdit
        );
        deleteStudentFromTable();
        deleteStudentFromModal();
        //добавляем карточку студента при клике на ФИО
        addStudentCard(filterResult);
      }, 300);
    }
  });
}
// фильтрация объекта (универсальная)
const filterObject = (arr, prop, value) => {
  let result = [];
  copy = [...arr]
  for (const item of copy) {
    if (String(item[prop]).includes(value) === true) result.push(item)
  }
  return result
}
//инициализация библиотеки choices (!!!)
const conditionsChoiceInitialization = (el, index) => {
  if (index === 0) {
    if (!el.choices && !el.classList.contains('choices__input')) {
      choices0 = new Choices(el, {
        searchEnabled: false,
        shouldSort: false,
        position: "bottom",
        itemSelectText: "",
        allowHTML: true,
        choices: [
          {
            value: "Телефон",
            label: "Телефон",
          },
          {
            value: "AdditionalPhone",
            label: "Доп. телефон",
          },
          {
            value: "Email",
            label: "Email",
          },
          {
            value: "vk",
            label: "Vk",
          },
          {
            value: "Facebook",
            label: "Facebook",
          },
          {
            value: "twitter",
            label: "Twitter",
          },
          {
            value: "Other",
            label: "Другое",
          },
        ],
      });
    }
  }
  if (index === 1) {
    if (!el.classList.contains('choices__input')) {
      choices1 = new Choices(el, {
        searchEnabled: false,
        shouldSort: false,
        position: "bottom",
        itemSelectText: "",
        allowHTML: true,
        choices: [
          {
            value: "Телефон",
            label: "Телефон",
          },
          {
            value: "AdditionalPhone",
            label: "Доп. телефон",
          },
          {
            value: "Email",
            label: "Email",
          },
          {
            value: "vk",
            label: "Vk",
          },
          {
            value: "Facebook",
            label: "Facebook",
          },
          {
            value: "twitter",
            label: "Twitter",
          },
          {
            value: "Other",
            label: "Другое",
          },
        ],
      });
    }

  }
  if (index === 2) {
    if (!el.classList.contains('choices__input')) {
      choices2 = new Choices(el, {
        searchEnabled: false,
        shouldSort: false,
        position: "bottom",
        itemSelectText: "",
        allowHTML: true,
        choices: [
          {
            value: "Телефон",
            label: "Телефон",
          },
          {
            value: "AdditionalPhone",
            label: "Доп. телефон",
          },
          {
            value: "Email",
            label: "Email",
          },
          {
            value: "vk",
            label: "Vk",
          },
          {
            value: "Facebook",
            label: "Facebook",
          },
          {
            value: "twitter",
            label: "Twitter",
          },
          {
            value: "Other",
            label: "Другое",
          },
        ],
      });
    }
  }
  if (index === 3) {
    if (!el.classList.contains('choices__input')) {
      choices3 = new Choices(el, {
        searchEnabled: false,
        shouldSort: false,
        position: "bottom",
        itemSelectText: "",
        allowHTML: true,
        choices: [
          {
            value: "Телефон",
            label: "Телефон",
          },
          {
            value: "AdditionalPhone",
            label: "Доп. телефон",
          },
          {
            value: "Email",
            label: "Email",
          },
          {
            value: "vk",
            label: "Vk",
          },
          {
            value: "Facebook",
            label: "Facebook",
          },
          {
            value: "twitter",
            label: "Twitter",
          },
          {
            value: "Other",
            label: "Другое",
          },
        ],
      });
    }
  }
  if (index === 4) {
    if (!el.classList.contains('choices__input')) {
      choices4 = new Choices(el, {
        searchEnabled: false,
        shouldSort: false,
        position: "bottom",
        itemSelectText: "",
        allowHTML: true,
        choices: [
          {
            value: "Телефон",
            label: "Телефон",
          },
          {
            value: "AdditionalPhone",
            label: "Доп. телефон",
          },
          {
            value: "Email",
            label: "Email",
          },
          {
            value: "vk",
            label: "Vk",
          },
          {
            value: "Facebook",
            label: "Facebook",
          },
          {
            value: "twitter",
            label: "Twitter",
          },
          {
            value: "Other",
            label: "Другое",
          },
        ],
      });
    }
  }
  if (index === 5) {
    if (!el.classList.contains('choices__input')) {
      choices5 = new Choices(el, {
        searchEnabled: false,
        shouldSort: false,
        position: "bottom",
        itemSelectText: "",
        allowHTML: true,
        choices: [
          {
            value: "Телефон",
            label: "Телефон",
          },
          {
            value: "AdditionalPhone",
            label: "Доп. телефон",
          },
          {
            value: "Email",
            label: "Email",
          },
          {
            value: "vk",
            label: "Vk",
          },
          {
            value: "Facebook",
            label: "Facebook",
          },
          {
            value: "twitter",
            label: "Twitter",
          },
          {
            value: "Other",
            label: "Другое",
          },
        ],
      });
    }
  }
  if (index === 6) {
    if (!el.classList.contains('choices__input')) {
      choices6 = new Choices(el, {
        searchEnabled: false,
        shouldSort: false,
        position: "bottom",
        itemSelectText: "",
        allowHTML: true,
        choices: [
          {
            value: "Телефон",
            label: "Телефон",
          },
          {
            value: "AdditionalPhone",
            label: "Доп. телефон",
          },
          {
            value: "Email",
            label: "Email",
          },
          {
            value: "vk",
            label: "Vk",
          },
          {
            value: "Facebook",
            label: "Facebook",
          },
          {
            value: "twitter",
            label: "Twitter",
          },
          {
            value: "Other",
            label: "Другое",
          },
        ],
      });
    }
  }
  if (index === 7) {
    if (!el.classList.contains('choices__input')) {
      choices7 = new Choices(el, {
        searchEnabled: false,
        shouldSort: false,
        position: "bottom",
        itemSelectText: "",
        allowHTML: true,
        choices: [
          {
            value: "Телефон",
            label: "Телефон",
          },
          {
            value: "AdditionalPhone",
            label: "Доп. телефон",
          },
          {
            value: "Email",
            label: "Email",
          },
          {
            value: "vk",
            label: "Vk",
          },
          {
            value: "Facebook",
            label: "Facebook",
          },
          {
            value: "twitter",
            label: "Twitter",
          },
          {
            value: "Other",
            label: "Другое",
          },
        ],
      });
    }
  }
  if (index === 8) {
    if (!el.classList.contains('choices__input')) {
      choices8 = new Choices(el, {
        searchEnabled: false,
        shouldSort: false,
        position: "bottom",
        itemSelectText: "",
        allowHTML: true,
        choices: [
          {
            value: "Телефон",
            label: "Телефон",
          },
          {
            value: "AdditionalPhone",
            label: "Доп. телефон",
          },
          {
            value: "Email",
            label: "Email",
          },
          {
            value: "vk",
            label: "Vk",
          },
          {
            value: "Facebook",
            label: "Facebook",
          },
          {
            value: "twitter",
            label: "Twitter",
          },
          {
            value: "Other",
            label: "Другое",
          },
        ],
      });
    }
  }
  if (index === 9) {
    if (!el.classList.contains('choices__input')) {
      choices9 = new Choices(el, {
        searchEnabled: false,
        shouldSort: false,
        position: "bottom",
        itemSelectText: "",
        allowHTML: true,
        choices: [
          {
            value: "Телефон",
            label: "Телефон",
          },
          {
            value: "AdditionalPhone",
            label: "Доп. телефон",
          },
          {
            value: "Email",
            label: "Email",
          },
          {
            value: "vk",
            label: "Vk",
          },
          {
            value: "Facebook",
            label: "Facebook",
          },
          {
            value: "twitter",
            label: "Twitter",
          },
          {
            value: "Other",
            label: "Другое",
          },
        ],
      });
    }
  }
}
// удаляем обработчики Choices при удалении контакта (!!!)
const conditionsRemovingChoicesEvents = (e) => {

  if (e.target.parentElement.children[0].children[0].children[0]) {
    let defaultSelector = e.target.parentElement.children[0].children[0].children[0].children[0];
    if (choices0) {
      if (defaultSelector === choices0.passedElement.element && choices0.initialised === true) {
        choices0.destroy();
      }
    }
    if (choices1) {
      if (defaultSelector === choices1.passedElement.element && choices1.initialised === true)
        choices1.destroy();
    }
    if (choices2) {
      if (defaultSelector === choices2.passedElement.element && choices2.initialised === true)
        choices2.destroy();
    }
    if (choices3) {
      if (defaultSelector === choices3.passedElement.element && choices3.initialised === true)
        choices3.destroy();
    }
    if (choices4) {
      if (defaultSelector === choices4.passedElement.element && choices4.initialised === true)
        choices4.destroy();
    }
    if (choices5) {
      if (defaultSelector === choices5.passedElement.element && choices5.initialised === true)
        choices5.destroy();
    }
    if (choices6) {
      if (defaultSelector === choices6.passedElement.element && choices6.initialised === true)
        choices6.destroy();
    }
    if (choices7) {
      if (defaultSelector === choices7.passedElement.element && choices7.initialised === true)
        choices7.destroy();
    }
    if (choices8) {
      if (defaultSelector === choices8.passedElement.element && choices8.initialised === true)
        choices8.destroy();
    }
    if (choices9) {
      if (defaultSelector === choices9.passedElement.element && choices9.initialised === true)
        choices9.destroy();
    }
  }
}
// добавляем события при нажатии на кнопку Добавить контакт в Новый клиент
const addContactEvents = () => {
  addBtncontact.addEventListener("click", (e) => {
    e.preventDefault();

    // при нажатии добавляется контакт студента (селект и импут для ввода)
    Inputmask({mask: "+7 (999)-999-99-99",}).mask(contactsInput);
    inputBlock.classList.add("modal__contacts-container");
    inputBlock.innerHTML = inputBlockInnerHtml;

    let contactBlocks = document.querySelectorAll(".modal__contacts-container");
    // если контактов меньше 10, добавляется новый
    if (contactBlocks.length <= 9) {
      contactsContainer.appendChild(inputBlock.cloneNode(true));
    }

    // добавляются паддинги к кнопке и блоку Добавить контакт
    if (contactBlocks.length >= 0) {
      contactsContainer.classList.add("pt-25");
      addBtnContainer.classList.add("pb-25");
    }

    // отключаем кнопку, когда контактов становится 10
    if (contactBlocks.length === 9) addBtncontact.style.display = 'none';

    selectInputs = document.querySelectorAll(".modal__contacts-select");
    selectInputs.forEach((el, index) => {

      //инициализация библиотеки choices
      conditionsChoiceInitialization(el, index);

      let selectorInput;
      selectorInput = el.parentElement.parentElement.parentElement.parentElement.children[1];

      // делаем маску для нового контакта при нажатии Добавить новый контакт (маска по дефолту до выбора селекта)
      if (index === selectInputs.length - 1) {
        Inputmask("tel", {
          mask: "+7 (999)-999-99-99",
        }).mask(selectorInput);
      }

      //делаем маски для каждого инпута по типу
      el.addEventListener("change", () => {
        addInputsMuskCondition(el, selectorInput)
      })
    });

    // удаляем контакт
    deleteBtns = document.querySelectorAll(".modal__contacts-input-delete");
    deleteBtns.forEach((el) => {
      el.addEventListener("click", (e) => {
        // удаляем обработчики Choices при удалении контакта
        conditionsRemovingChoicesEvents(e)
        e.target.parentElement.remove();
        addBtncontact.style.display = 'block';
        contactBlocks = document.querySelectorAll(".modal__contacts-container");
        errorEmail.classList.remove("is-active");
        errorPhone.classList.remove("is-active");
        addBtnContainer.classList.add("mb-25");
        if (!contactBlocks.length) {
          addBtnContainer.classList.remove("pb-25");
          contactsContainer.classList.remove("pt-25");
        }
      });
    });
  });
};
// удаляется студент при нажатии кнопки Удалить в таблице
const deleteStudentFromTable = () => {
  let idToDelete;
  setTimeout(() => {
    document.querySelectorAll(".clients__table-delete-content").forEach((e) => {
      e.addEventListener("click", () => {
        idToDelete = e.parentElement.parentElement.childNodes[1].innerHTML;
      });
    });
    document
      .querySelector(".modal__form-btn-delete-main")
      .addEventListener("click", () => {
        deleteStudent(idToDelete);
      });
  }, 500);
};
// удаляется студент при нажатии кнопки Изменить => Удалить студента
const deleteStudentFromModal = () => {
  let deleteBtnInEdit = document.querySelector(".modal__form-btn-edit-delete");
  setTimeout(() => {
    deleteBtnInEdit.addEventListener("click", (e) => {
      e.preventDefault();
      idToDelete =
        e.target.parentElement.parentElement.parentElement.children[1].innerHTML.split(
          " "
        )[1];
      document
        .querySelector(".modal__form-btn-delete-main")
        .addEventListener("click", () => {
          deleteStudent(idToDelete);
        });
    });
  }, 500);
};
// валидация инпута во время ввода
const validateInputOnline = () => {
  newStudentName.addEventListener("input", () => {
    if (newStudentName.value.length >= 2 && newStudentName.value.length <= 20) {
      errorName.classList.remove("is-active");
      newStudentName.style.borderColor = "#C8C5D1";
      addBtnContainer.style.marginBottom = "25px";

    } else {
      errorName.classList.add("is-active");
      addBtnContainer.style.marginBottom = "0";
      newStudentName.style.borderColor = "#F06A4D";
    }
  });

  newStudentSurname.addEventListener("input", () => {
    if (newStudentSurname.value.length >= 2 &&
      newStudentSurname.value.length <= 20)
      {
        errorSurname.classList.remove("is-active");
        newStudentSurname.style.borderColor = "#C8C5D1";
        addBtnContainer.style.marginBottom = "25px";

      } else {
        errorSurname.classList.add("is-active");
        addBtnContainer.style.marginBottom = "0";
        newStudentSurname.style.borderColor = "#F06A4D";
      }
  });
};
// валидация инпута во время ввода в Измениить контакт
const validateInputOnlineEdit = () => {
  editStudentName.addEventListener("input", () => {
    if (editStudentName.value.length >= 2 &&
      editStudentName.value.length <= 20)
      {
        errorNameEdit.classList.remove("is-active");
        editStudentName.style.borderColor = "#C8C5D1";
        addBtnContainerEdit.style.marginBottom = "25px";
      } else {
        errorNameEdit.classList.add("is-active");
        addBtnContainerEdit.style.marginBottom = "0";
        editStudentName.style.borderColor = "#F06A4D";
      }
  });

  editStudentSurname.addEventListener("input", () => {
    if (editStudentSurname.value.length >= 2 &&
      editStudentSurname.value.length <= 20)
      {
        errorSurnameEdit.classList.remove("is-active");
        editStudentSurname.style.borderColor = "#C8C5D1";
        addBtnContainerEdit.style.marginBottom = "25px";
      } else {
        errorSurnameEdit.classList.add("is-active");
        addBtnContainerEdit.style.marginBottom = "0";
        editStudentSurname.style.borderColor = "#F06A4D";
      }
  });
};
// сохранение Нового клиента на сервер
const addSaveBtnEvents = () => {
  saveBtn.addEventListener("click", (ele) => {
    ele.preventDefault();

    newStudentName = document.querySelector(".name");
    newStudentSurname = document.querySelector(".surname");
    newStudentLastName = document.querySelector(".lastname");
    let mailErrorCount = 0;
    let phoneErrorCount = 0;

    //валидация при нажатии кнопки Сохранить
    if (newStudentName.value.length >= 2 &&
      newStudentName.value.length <= 20 &&
      newStudentSurname.value.length >= 2 &&
      newStudentSurname.value.length <= 20)
      {
        // форматируем вводимые данные в ФИО
        newStudentName = newStudentName.value.trim();
        newStudentSurname = newStudentSurname.value.trim();

        newStudentName = newStudentName[0].toUpperCase() + newStudentName.slice(1).toLowerCase();
        newStudentSurname = newStudentSurname[0].toUpperCase() + newStudentSurname.slice(1).toLowerCase();

        if (newStudentLastName.value !== "") {
          newStudentLastName.value = newStudentLastName.value.trim();
          newStudentLastName.value = newStudentLastName.value[0].toUpperCase() + newStudentLastName.value.slice(1).toLowerCase();
        }

        let selectTypesArr = [];
        let inputTypesArr = [];
        choicesValues = document.querySelectorAll(".choices");
        choicesValues.forEach((elem) => {
          selectTypesArr.push(elem.children[0].children[0].value);
          inputTypesArr.push(elem.parentElement.parentElement.children[1].value);
        });

        bodyJSONRequest = {
          surname: newStudentSurname,
          name: newStudentName,
          lastName: newStudentLastName.value,
          contacts: [],
        };
        //переформатируем номера телефонов или почты до отправки на сервер
        for (let i = 0; i < selectTypesArr.length; i++) {
          if (
            selectTypesArr[i] === "Телефон" ||
            selectTypesArr[i] === "AdditionalPhone"
          ) {
            unformattedMask = Inputmask.unmask(inputTypesArr[i], { mask: "+7 (999)-999-99-99",});

            // проверяем валидность Телефон
            if (unformattedMask.length !== 10) phoneErrorCount++;

            inputTypesArr[i] = `tel:+7${unformattedMask}`;

          } else if (selectTypesArr[i] === "Email") {
            // проверяем валидность Email

            if (isEmailValid(inputTypesArr[i]) === false) mailErrorCount++;

            inputTypesArr[i] = `mailto:${inputTypesArr[i]}`;

          } else {
            inputTypesArr[i] = inputTypesArr[i];
          }

          bodyJSONRequest.contacts[i] = {
            type: selectTypesArr[i],
            value: inputTypesArr[i],
          };
        }

        if (mailErrorCount !== 0) {
          addBtnContainer.style.marginBottom = "0px";
          errorEmail.classList.add("is-active");

        } else {
          errorEmail.classList.remove("is-active");
          addBtnContainer.style.marginBottom = "25px";
        }
        if (phoneErrorCount !== 0) {
          errorPhone.classList.add("is-active");
          addBtnContainer.style.marginBottom = "0";

        } else {
          errorPhone.classList.remove("is-active");
          addBtnContainer.style.marginBottom = "25px";
        }
        //создаём студента, если телефоны и почты введены без ошибок
        if (mailErrorCount === 0 && phoneErrorCount === 0) {
          createStudentItem();
        }

    } else {
      if (
        newStudentName.value.length >= 2 &&
        newStudentName.value.length <= 20
      ) {
        errorName.classList.remove("is-active");
        newStudentName.style.borderColor = "#C8C5D1";
        addBtnContainer.style.marginBottom = "25px";

      } else {
        errorName.classList.add("is-active");
        addBtnContainer.style.marginBottom = "0";
        newStudentName.style.borderColor = "#F06A4D";
      }

      if (
        newStudentSurname.value.length >= 2 &&
        newStudentSurname.value.length <= 20
      ) {
        errorSurname.classList.remove("is-active");
        newStudentSurname.style.borderColor = "#C8C5D1";
        addBtnContainer.style.marginBottom = "25px";

      } else {
        errorSurname.classList.add("is-active");
        addBtnContainer.style.marginBottom = "0";
        newStudentSurname.style.borderColor = "#F06A4D";
      }
    }
  });
};
// добавляем событие на кнопку удаления контакта в модальном окне Изменить контакт
const deleteContactInModal = () => {
  setTimeout(() => {
    deleteBtns = document.querySelectorAll(".modal__contacts-input-delete");
    deleteBtns.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.target.parentElement.remove();
        addBtncontact.style.display = 'block';
      });
    });
  }, 500);
}
// добавляем маски для созданных инпутов
const addInputsMuskCondition = (el, selectorInput) => {
  selectValue = el.value;
  if (selectValue === "Телефон" || selectValue === "AdditionalPhone") {
    selectorInput.type = "tel";
    Inputmask("tel", {mask: "+7 (999)-999-99-99",}).mask(selectorInput);

  } else if (selectValue === "Email") {
    selectorInput.type = "email";
    if (selectorInput.inputmask) selectorInput.inputmask.remove();

  } else if (selectValue === "vk") {
    selectorInput.type = "url";
    if (selectorInput.inputmask) selectorInput.inputmask.remove();
    Inputmask("url", {mask: "https://vk.com/*{1,20}",}).mask(selectorInput);

  } else if (selectValue === "Facebook") {
    selectorInput.type = "url";
    if (selectorInput.inputmask) selectorInput.inputmask.remove();
    Inputmask("url", {mask: "https://fb.com/*{1,20}",}).mask(selectorInput);

  } else if (selectValue === "twitter") {
    selectorInput.type = "url";
    if (selectorInput.inputmask) selectorInput.inputmask.remove();
    Inputmask("url", {mask: "https://twitter.com/*{1,20}",}).mask(selectorInput);

  } else if (selectValue === "Other") {
    selectorInput.type = "url";
    if (selectorInput.inputmask) selectorInput.inputmask.remove();
  }
}
// выставляем выбор селекта и значение инпута у новых choices при открытии Изменить контакт
const addConditionOfSelectors = (index, selectorInput, selectTypeArr, inputValueArr) => {
  if (index === 0) {
    choices0.setChoiceByValue(selectTypeArr);
    selectorInput.value = inputValueArr;

  } else if (index === 1) {
    choices1.setChoiceByValue(selectTypeArr);
    selectorInput.value = inputValueArr;

  } else if (index === 2) {
    choices2.setChoiceByValue(selectTypeArr);
    selectorInput.value = inputValueArr;

  } else if (index === 3) {
    choices3.setChoiceByValue(selectTypeArr);
    selectorInput.value = inputValueArr;

  } else if (index === 4) {
    choices4.setChoiceByValue(selectTypeArr);
    selectorInput.value = inputValueArr;

  } else if (index === 5) {
    choices5.setChoiceByValue(selectTypeArr);
    selectorInput.value = inputValueArr;

  } else if (index === 6) {
    choices6.setChoiceByValue(selectTypeArr);
    selectorInput.value = inputValueArr;

  } else if (index === 7) {
    choices7.setChoiceByValue(selectTypeArr);
    selectorInput.value = inputValueArr;

  } else if (index === 8) {
    choices8.setChoiceByValue(selectTypeArr);
    selectorInput.value = inputValueArr;

  } else if (index === 9) {
    choices9.setChoiceByValue(selectTypeArr);
    selectorInput.value = inputValueArr;
  }
}
// удаляем контакт в модальном окне Изменить контакт
const deleteContactInModalEdit = (addBtnContactEdit, contactBlocks, contactsContainerEdit, addBtnContainerEdit) => {
  deleteBtns = document.querySelectorAll(".modal__contacts-input-delete");
  deleteBtns.forEach((el) => {
    el.addEventListener("click", (e) => {
      // удаляем обработчики Choices при удалении контакта
      conditionsRemovingChoicesEvents(e)
      e.target.parentElement.remove();
      addBtnContactEdit.style.display = 'block';
      contactBlocks = document.querySelectorAll(".modal__contacts-container");
      if (!contactBlocks.length) {
        contactsContainerEdit.classList.remove("pt-25");
        addBtnContainerEdit.classList.remove("pb-25");
      }
    });
  });
};
// заполняем таблицу Изменить данные
const fillModalEdit = (data, addBtnContactEdit, contactBlocks, contactsContainerEdit, addBtnContainerEdit) => {
  const tableEdit = document.querySelectorAll(".clients__table-edit-content");
  tableEdit.forEach((e) => {
    e.addEventListener("click", () => {
      //находим id студента для изменения
      idToChange = e.parentElement.parentElement.children[0].innerHTML;

      for (let i = 0; i < data.length; i++) {
        if (idToChange == data[i].id) studenDataById = data[i];
      }

      // заполняем окно Изменить данные при открытии
      editStudentSurname.value = studenDataById.surname;
      editStudentName.value = studenDataById.name;
      editStudentLastName.value = studenDataById.lastName;
      editStudentId.innerHTML = `ID: ${studenDataById.id}`;

      // добавляем событие на кнопку удаления контакта в модальном окне Изменить контакт
      deleteContactInModal();

      // добавляем имеющиеся контакты из базы
      inputBlock.classList.add("modal__contacts-container");
      inputBlock.innerHTML = inputBlockInnerHtml;

      // создаём массивы с селекторами и их значениями для контактов
      for (let i = 0; i < studenDataById.contacts.length; i++) {
        contactsContainerEdit.appendChild(inputBlock.cloneNode(true));
      }

      let selectTypeArr = [];
      let inputValueArr = [];
      for (let i = 0; i < studenDataById.contacts.length; i++) {
        selectTypeArr.push(studenDataById.contacts[i].type);
        if (
          studenDataById.contacts[i].value[0] === "m" ||
          studenDataById.contacts[i].value[0] === "t"
        ) {
          inputValueArr.push(studenDataById.contacts[i].value.split(":")[1]);
        } else inputValueArr.push(studenDataById.contacts[i].value);
      }

      // инициируем choices для каждого созданного контакта
      selectInputs = document.querySelectorAll(".modal__contacts-select");
      selectInputs.forEach((el, index) => {
        conditionsChoiceInitialization(el, index);

        let selectorInput;
        selectorInput = el.parentElement.parentElement.parentElement.parentElement.children[1];

        // выставляем выбор селекта и значение инпута у новых choices при открытии Изменить контакт
        addConditionOfSelectors(
          index,
          selectorInput,
          selectTypeArr[index],
          inputValueArr[index]
        );

        //делаем маски для каждого созданного из базы инпута по типу
        addInputsMuskCondition(el, selectorInput);

        //делаем маски для каждого нового созданного инпута по типу
        el.addEventListener("change", () => {
          addInputsMuskCondition(el, selectorInput);
        });

        // удаляем контакт

        contactBlocks = document.querySelectorAll(".modal__contacts-container");
        deleteContactInModalEdit(
          addBtnContactEdit,
          contactBlocks,
          contactsContainerEdit,
          addBtnContainerEdit
        );
      });
      if (contactBlocks.length > 0) {
        contactsContainerEdit.classList.add("pt-25");
        addBtnContainerEdit.classList.add("pb-25");
      }
      // отключаем кнопку, когда контактов становится 10
      if (contactBlocks.length === 10) addBtnContactEdit.style.display = "none";
    });
  });
};
// добавляем события при нажатии на кнопку Добавить клиента в Изменить контакт
const addBtnContactEditEvents = () => {
  addBtnContactEdit.addEventListener("click", (e) => {
    e.preventDefault();

    contactBlocks = document.querySelectorAll(".modal__contacts-container");

    if (contactBlocks.length >= 0) {
      contactsContainerEdit.classList.add("pt-25");
      addBtnContainerEdit.classList.add("pb-25");
    }

    if (contactBlocks.length <= 9) contactsContainerEdit.appendChild(inputBlock.cloneNode(true));

    // отключаем кнопку, когда контактов становится 10

    if (contactBlocks.length === 9) addBtnContactEdit.style.display = "none";

    selectInputs = document.querySelectorAll(".modal__contacts-select");

    selectInputs.forEach((el, index) => {
      conditionsChoiceInitialization(el, index);

      let selectorInput;
      selectorInput =
        el.parentElement.parentElement.parentElement.parentElement.children[1];

      // делаем маску для нового контакта при нажатии Добавить новый контакт (маска по дефолту до выбора селекта)
      if (index === selectInputs.length - 1) Inputmask("tel", {mask: "+7 (999)-999-99-99",}).mask(selectorInput);

      //делаем маски для каждого инпута по типу
      el.addEventListener("change", () => {
        addInputsMuskCondition(el, selectorInput);
      });

      // удаляем контакт в модальном окне Изменить контакт
      deleteContactInModalEdit(
        addBtnContactEdit,
        contactBlocks,
        contactsContainerEdit,
        addBtnContainerEdit
      );
    });
  });
};
// очищаем контакты студента при закрытии модального окна
const clearModalInputs = () => {
  window.addEventListener("click", () => {
    if (!document.querySelector(".modal").classList.contains("is-open")) {
      if (choices0) choices0.destroy();
      if (choices1) choices1.destroy();
      if (choices2) choices2.destroy();
      if (choices3) choices3.destroy();
      if (choices4) choices4.destroy();
      if (choices5) choices5.destroy();
      if (choices6) choices6.destroy();
      if (choices7) choices7.destroy();
      if (choices8) choices8.destroy();
      if (choices9) choices9.destroy();
      document.querySelectorAll(".modal__contacts-container").forEach((e) => {
        e.remove();
      });
      addBtncontact.style.display = "block";
      addBtnContactEdit.style.display = "block";
      document.querySelector(".surname").value = "";
      document.querySelector(".name").value = "";
      document.querySelector(".lastname").value = "";
      addBtnContainer.classList.remove("pb-25");
      contactsContainer.classList.remove("pt-25");
      contactsContainerEdit.classList.remove("pt-25");
      addBtnContainerEdit.classList.remove("pb-25");
      errorSurnameEdit.classList.remove("is-active");
      errorNameEdit.classList.remove("is-active");
      editStudentSurname.style.borderColor = "#C8C5D1";
      editStudentName.style.borderColor = "#C8C5D1";
      addBtnContainerEdit.style.marginBottom = "25px";
    }
  });
};
// добавляем счетчик ошибок при валидации Email
const addMailErrorCount = () => {
  return mailErrorCount++;
};
// добавляем счетчик ошибок при валидации Phone
const addPhoneErrorCount = () => {
  return phoneErrorCount++;
};
// создаём объект с контактами для поля Изменить контакт из API
const createContactsArrEdit = (selectTypesArr, inputTypesArr, bodyJSONRequest) => {

  for (let i = 0; i < selectTypesArr.length; i++) {
    if (
      selectTypesArr[i] === "Телефон" ||
      selectTypesArr[i] === "AdditionalPhone"
    ) {
      unformattedMask = Inputmask.unmask(inputTypesArr[i], {
        mask: "+7 (999)-999-99-99",
      });

      // проверяем валидность Телефон в Изменить контакт

      if (unformattedMask.length !== 10) {
        addPhoneErrorCount();
      }

      inputTypesArr[i] = `tel:+7${unformattedMask}`;
    } else if (selectTypesArr[i] === "Email") {
      // проверяем валидность Email в Изменить контакт

      if (isEmailValid(inputTypesArr[i]) === false) {
        addMailErrorCount();
      }

      inputTypesArr[i] = `mailto:${inputTypesArr[i]}`;
    } else {
      inputTypesArr[i] = inputTypesArr[i];
    }

    bodyJSONRequest.contacts[i] = {
      type: selectTypesArr[i],
      value: inputTypesArr[i],
    };
  }
};
// Сохранение изменённого клиента
const addSaveBtnEditEvents = () => {
  const saveEditBtn = document.querySelector(".modal__form-btn-edit");
  saveEditBtn.addEventListener("click", (e) => {
    e.preventDefault();
    editStudentSurname = document.querySelector(".surname-edit");
    editStudentName = document.querySelector(".name-edit");
    editStudentLastName = document.querySelector(".lastname-edit");
    editStudentId = document.querySelector(".modal__heading-edit-id");

    mailErrorCount = 0;
    phoneErrorCount = 0;

    if (
      editStudentName.value.length >= 2 &&
      editStudentName.value.length <= 20 &&
      editStudentSurname.value.length >= 2 &&
      editStudentSurname.value.length <= 20
    ) {
      // форматируем вводимые данные в ФИО
      editStudentName.value = editStudentName.value.trim();
      editStudentSurname.value = editStudentSurname.value.trim();

      if (editStudentLastName.value !== "") {
        editStudentLastName.value = editStudentLastName.value.trim();
        editStudentLastName.value =
          editStudentLastName.value[0].toUpperCase() +
          editStudentLastName.value.slice(1).toLowerCase();
      }

      editStudentName.value =
        editStudentName.value[0].toUpperCase() +
        editStudentName.value.slice(1).toLowerCase();
      editStudentSurname.value =
        editStudentSurname.value[0].toUpperCase() +
        editStudentSurname.value.slice(1).toLowerCase();

      bodyJSONRequest = {
        surname: editStudentSurname.value,
        name: editStudentName.value,
        lastName: editStudentLastName.value,
        contacts: [],
      };

      let selectTypesArr = [];
      let inputTypesArr = [];
      choicesValues = document.querySelectorAll(".choices");
      choicesValues.forEach((elem) => {
        selectTypesArr.push(elem.children[0].children[0].value);
        inputTypesArr.push(elem.parentElement.parentElement.children[1].value);
      });

      createContactsArrEdit(
        selectTypesArr,
        inputTypesArr,
        bodyJSONRequest
      );

      let mailErrors = addMailErrorCount();
      let phoneErrors = addPhoneErrorCount();


      if (mailErrors !== 0) {
        addBtnContainerEdit.style.marginBottom = "0px";
        errorEmailEdit.classList.add("is-active");
      } else {
        errorEmailEdit.classList.remove("is-active");
        addBtnContainerEdit.style.marginBottom = "25px";
      }
      if (phoneErrors !== 0) {
        errorPhoneEdit.classList.add("is-active");
        addBtnContainerEdit.style.marginBottom = "0";
      } else {
        errorPhoneEdit.classList.remove("is-active");
        addBtnContainerEdit.style.marginBottom = "25px";
      }

      editStudentId = editStudentId.innerHTML.split(" ")[1];
      if (mailErrors === 0 && phoneErrors === 0) {

        changeStudentItem(editStudentId, bodyJSONRequest);
      }
    } else {
      if (
        editStudentName.value.length >= 2 &&
        editStudentName.value.length <= 20
      ) {
        errorNameEdit.classList.remove("is-active");
        editStudentName.style.borderColor = "#C8C5D1";
        addBtnContainerEdit.style.marginBottom = "25px";
      } else {
        errorNameEdit.classList.add("is-active");
        editStudentName.style.borderColor = "#F06A4D";
        addBtnContainerEdit.style.marginBottom = "0";
      }

      if (
        editStudentSurname.value.length >= 2 &&
        editStudentSurname.value.length <= 20
      ) {
        errorSurnameEdit.classList.remove("is-active");
        editStudentSurname.style.borderColor = "#C8C5D1";
        addBtnContainerEdit.style.marginBottom = "25px";
      } else {
        errorSurnameEdit.classList.add("is-active");
        addBtnContainerEdit.style.marginBottom = "0";
        editStudentSurname.style.borderColor = "#F06A4D";
      }
    }
  });
};
// отрисовка заголовков таблицы
const fillTableHeader = (id, surname, name, lastName, createAt, updateAt) => {
  let fillTableHeaderData = `
  <td class="clients__table-id-content">${id}</td>
  <td class="clients__table-name-content">
    <a class="clients__table-name-content-link" href="#" data-graph-path="four" data-graph-animation="fadeInUp"
    data-graph-speed="500">
      ${ surname + " " + name + " " + lastName }
    </a>
  </td>
  <td class="clients__table-create-content">${formatTime(createAt)}
    <span class="clients__table-date-time">${createAt.slice(11, 16)}</span>
  </td>

  <td class="clients__table-update-content">${formatTime(updateAt)}
    <span class="clients__table-date-time">${updateAt.slice(11, 16)}</span>
  </td>
`;
  return fillTableHeaderData;
};
// добавляются контакты студента при загрузке страницы
const addStudentContacts = (contactsData, contacts) => {
  for (let i = 0; i < contactsData.length; i++) {

    if (contactsData[i].type === "vk") contacts.innerHTML += contactsVkData(contactsData[i]);

    if (contactsData[i].type === "Facebook") contacts.innerHTML += contactsFacebookData(contactsData[i]);

    if (contactsData[i].type === "Телефон") contacts.innerHTML += contactsPhoneData(contactsData[i]);

    if (contactsData[i].type === "Email") contacts.innerHTML += contactsEmailData(contactsData[i]);

    if (contactsData[i].type === "twitter") contacts.innerHTML += contactsTwitterData(contactsData[i]);

    if (contactsData[i].type === "AdditionalPhone") contacts.innerHTML += contactsAdditionalPhoneData(contactsData[i]);

    if (contactsData[i].type === "Other") contacts.innerHTML += contactsOtherData(contactsData[i]);
  }

  return contactsData.innerHTML;
};
// генеруруем разметку для добавления контактов Vk в таблицу
const contactsVkData = (contactsData) => {
  return `
  <td class="clients__table-contacts-content">
    <a class="clients__table-contacts-content-link" tooltip="Vk: @${contactsData.value.substr(15)}" tooltip-position="top" href="${contactsData.value}">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.7">
          <path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#B79DFF"/>
        </g>
      </svg>
    </a>
  </td>
  `;
}
// генеруруем разметку для добавления контактов fb в таблицу
const contactsFacebookData = (contactsData) => {
return `
<td class="clients__table-contacts-content">
  <a class="clients__table-contacts-content-link" tooltip="Facebook: @${contactsData.value.substr(15)}" tooltip-position="top" href="${contactsData.value}">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.7">
        <path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#B79DFF"/>
      </g>
    </svg>
  </a>
  </td>
`;
}
// генеруруем разметку для добавления контактов phone в таблицу
const contactsPhoneData = (contactsData) => {

  //форматируется номер в +7 (ххх) ххх-хх-хх
  let contactTelTooltip = contactsData.value.substr(4);
  contactTelTooltip = `${contactTelTooltip.substr(
    0,
    2
  )} (${contactTelTooltip.substr(2, 3)}) ${contactTelTooltip.substr(
    5,
    3
  )}-${contactTelTooltip.substr(8, 2)}-${contactTelTooltip.substr(10, 2)}`;

  return `
<td class="clients__table-contacts-content">
  <a class="clients__table-contacts-content-link-phone" tooltip="${contactTelTooltip}" tooltip-position="top" href="${contactsData.value}">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.7">
        <circle cx="8" cy="8" r="8" fill="#B79DFF"/>
        <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/>
      </g>
    </svg>
  </a>
</td>
`;
};
// генеруруем разметку для добавления контактов email в таблицу
const contactsEmailData = (contactsData) => {
  return `
  <td class="clients__table-contacts-content">
    <a class="clients__table-contacts-content-link" tooltip="${contactsData.value.substr(7)}" tooltip-position="top" href="${contactsData.value}">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#B79DFF"/>
      </svg>
    </a>
  </td>
  `;
}
// генеруруем разметку для добавления контактов twitter в таблицу
const contactsTwitterData = (contactsData) => {
  return `
  <td class="clients__table-contacts-content">
    <a class="clients__table-contacts-content-link" tooltip="Twitter: @${contactsData.value.substr(20)}" tooltip-position="top" href="${contactsData.value}">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#B79DFF"/>
      </svg>
    </a>
  </td>
  `;
}
// генеруруем разметку для добавления контактов Доп. телефон в таблицу
const contactsAdditionalPhoneData = (contactsData) => {

  //форматируется Доп. номер в +7 (ххх) ххх-хх-хх
  let contactTelAddTooltip = contactsData.value.substr(4);
  contactTelAddTooltip = `${contactTelAddTooltip.substr(
    0,
    2
  )} (${contactTelAddTooltip.substr(2, 3)}) ${contactTelAddTooltip.substr(
    5,
    3
  )}-${contactTelAddTooltip.substr(8, 2)}-${contactTelAddTooltip.substr(
    10,
    2
  )}`;
  return `
  <td class="clients__table-contacts-content">
    <a class="clients__table-contacts-content-link" tooltip="&nbsp;&nbsp;Доп. телефон: &nbsp;&nbsp; ${contactTelAddTooltip}" tooltip-position="top" href="${contactsData.value}">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#B79DFF"/>
      </svg>
    </a>
  </td>
  `;
}
// генеруруем разметку для добавления контактов Другое в таблицу
const contactsOtherData = (contactsData) => {
  return `
  <td class="clients__table-contacts-content">
    <a class="clients__table-contacts-content-link" tooltip="${contactsData.value}" tooltip-position="top" href="${contactsData.value}">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#B79DFF"/>
      </svg>
    </a>
  </td>
  `;
}
// формат времени для данных таблицы
const formatTime = (el) => {
  el = String(el.split("T")[0].split("-").reverse()).split(",").join(".")
  return el
}
// проверка валидности email
const isEmailValid = (value) => {
  return EMAIL_REGEXP.test(value)
}
  //создаём полное имя в копии объекта Data
const createFio = (dataCopy, fio) => {
  for (key in dataCopy) {
    fio = dataCopy[key].surname + ' ' + dataCopy[key].name + ' ' + dataCopy[key].lastName;
    dataCopy[key].fio = fio;
  }
}
  //отключаем все селекторы choices
const setChoicesDisable = () => {
  if (choices0) choices0.disable();
  if (choices1) choices1.disable();
  if (choices2) choices2.disable();
  if (choices3) choices3.disable();
  if (choices4) choices4.disable();
  if (choices5) choices5.disable();
  if (choices6) choices6.disable();
  if (choices7) choices7.disable();
  if (choices8) choices8.disable();
  if (choices9) choices9.disable();
}
  //добавляем карточку студента при смене хеша
const addStudentCard = (data) => {
  tableNameContentLink = document.querySelectorAll(
    ".clients__table-name-content-link"
  );
  tableNameContentLink.forEach((e) => {
    idCard = e.parentElement.parentElement.children[0].innerHTML;
    e.setAttribute('href', `#${idCard}`)

    e.addEventListener("click", () => {
      idCard = e.parentElement.parentElement.children[0].innerHTML;
      for (let i = 0; i < data.length; i++) {
        if (idCard == data[i].id) {
          studenDataById = data[i];
        }
      }

      // заполняем окно Изменить данные при открытии
      cardStudentSurname.value = studenDataById.surname;
      cardStudentName.value = studenDataById.name;
      cardStudentLastName.value = studenDataById.lastName;
      cardStudentId.innerHTML = `ID: ${studenDataById.id}`;

      // добавляем имеющиеся контакты из базы
      inputBlock.classList.add("modal__contacts-container");
      inputBlock.innerHTML = inputBlockInnerHtmlCard;

      // создаём массивы с селекторами и их значениями для контактов
      for (let i = 0; i < studenDataById.contacts.length; i++) {
        document
          .querySelector(".modal__contacts-main-container-card")
          .appendChild(inputBlock.cloneNode(true));
      }

      let selectTypeArr = [];
      let inputValueArr = [];
      for (let i = 0; i < studenDataById.contacts.length; i++) {
        selectTypeArr.push(studenDataById.contacts[i].type);

        if (studenDataById.contacts[i].value[0] === "m") {
          inputValueArr.push(studenDataById.contacts[i].value.split(":")[1]);

        } else if (studenDataById.contacts[i].value[0] === "t") {
          let t = studenDataById.contacts[i].value.split("+")[1]
          t = t.substr(1)
          inputValueArr.push(t)

        } else inputValueArr.push(studenDataById.contacts[i].value);
      }

      // инициируем choices для каждого созданного контакта
      selectInputs = document.querySelectorAll(".modal__contacts-select");
      selectInputs.forEach((el, index) => {
        conditionsChoiceInitialization(el, index);
        setChoicesDisable()
        let selectorInput;
        selectorInput = el.parentElement.parentElement.parentElement.parentElement.children[1];

        // выставляем выбор селекта и значение инпута у новых choices при открытии Изменить контакт
        addConditionOfSelectors(
          index,
          selectorInput,
          selectTypeArr[index],
          inputValueArr[index]
        );

        addInputsMuskCondition(el, selectorInput);
      });
    });
  });
}
  //открытие карточки клиента при hashchange или первом запуске
const addStudentCardStart = () => {
  document.addEventListener('DOMContentLoaded', () => {
    if (location.hash !== '') {
      setTimeout(() => {
        tableNameContentLink.forEach(e => {
          if (e.hash === location.hash && !document.querySelector('.modal').classList.contains('is-open')) {
            e.click();
          }
        })
      }, 300);
    }
  });
  window.addEventListener('hashchange', () => {
    if (location.hash !== '') {
      tableNameContentLink.forEach(e => {
        if (e.hash === location.hash && !document.querySelector('.modal').classList.contains('is-open')) {
          e.click();
        }
      })
    }
  })
}

const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu
const modal = new GraphModal()
const tableContainer = document.querySelector(".clients__table-container")
const tableHeading = document.createElement("tr")
const inputBlock = document.createElement("div")
const saveBtn = document.querySelector(".save-new")
const contactsContainer = document.querySelector(".modal__contacts-main-container");
const addBtnContainer = document.querySelector(".modal__form-btn-container-add");
const contactsContainerEdit = document.querySelector(".modal__contacts-main-container-edit");
const addBtnContactEdit = document.querySelector(".modal__form-btn-add-in-edit");
const addBtncontact = document.querySelector(".modal__form-btn-add");
const contactsInput = document.querySelectorAll(".modal__contacts-input");
const errorEmpty = document.querySelector(".error-empty");
const addBtnContainerEdit = document.querySelector(".modal__form-btn-container-edit");
const errorSurnameEdit = document.querySelector(".error-surname-edit");
const errorNameEdit = document.querySelector(".error-name-edit");
const errorPhoneEdit = document.querySelector(".error-phone-edit");
const errorEmailEdit = document.querySelector(".error-email-edit");
const errorEmptyEdit = document.querySelector(".error-empty-edit");
const addClientBtn = document.querySelector('.clients__btn');
const errorSurname = document.querySelector(".error-surname");
const errorName = document.querySelector(".error-name");
const errorPhone = document.querySelector(".error-phone");
const errorEmail = document.querySelector(".error-email");
const listForAutocomplete = document.querySelector('#students-list');
const headerInput = document.querySelector('.header__search-input')
const cardStudentSurname = document.querySelector(".surname-card");
const cardStudentName = document.querySelector(".name-card");
const cardStudentLastName = document.querySelector(".lastname-card");
const cardStudentId = document.querySelector(".modal__heading-card-id");
const rowInnerHtml = `
<td class="clients__table-edit-container">
  <div class="clients__table-edit-content" data-graph-path="two" data-graph-animation="fadeInUp"
  data-graph-speed="500">
    <svg class="clients__table-edit-icon" width="16" height="16" viewbox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <use xlink:href="images/sprites.svg#edit"></use>
    </svg>
    <p class="clients__table-edit-text">Изменить</p>
  </div>

  <div class="clients__table-delete-content" data-graph-path="third" data-graph-animation="fadeInUp"
  data-graph-speed="500">
    <svg class="clients__table-delete-icon" width="16" height="16" viewbox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <use xlink:href="images/sprites.svg#delete"></use>
    </svg>
    <p class="clients__table-delete-text">Удалить</p>
  </div>
</td>
`;
const createTableInnerHtml = `
<table class="clients__table">
  <thead class="clients__table-heading-container"></thead>
</table>`
const tableHeadingInnerHtml = `
<th data-type="id" class="clients__table-id clients__table-sort-color">
  ${"ID"}
  <svg class="clients__table-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_221_919)">
      <path d="M10 6L9.295 5.295L6.5 8.085L6.5 2H5.5L5.5 8.085L2.71 5.29L2 6L6 10L10 6Z" fill="#9873FF"/>
    </g>
    <defs>
      <clipPath id="clip0_221_919">
      <rect width="12" height="12" fill="white"/>
      </clipPath>
    </defs>
  </svg>
</th>
<th data-type="fio" class="clients__table-name clients__table-sort-color">
  ${"Фамилия Имя Отчество"}
  <span class="clients__table-name-sort">А-Я</span>
  <svg class="clients__table-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_221_919)">
      <path d="M10 6L9.295 5.295L6.5 8.085L6.5 2H5.5L5.5 8.085L2.71 5.29L2 6L6 10L10 6Z" fill="#9873FF"/>
    </g>
    <defs>
      <clipPath id="clip0_221_919">
      <rect width="12" height="12" fill="white"/>
      </clipPath>
    </defs>
  </svg>
</th>
<th data-type="createdAt" class="clients__table-createat clients__table-sort-color">
  ${"Дата и время <br> создания"}
  <svg class="clients__table-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_221_919)">
      <path d="M10 6L9.295 5.295L6.5 8.085L6.5 2H5.5L5.5 8.085L2.71 5.29L2 6L6 10L10 6Z" fill="#9873FF"/>
    </g>
    <defs>
      <clipPath id="clip0_221_919">
      <rect width="12" height="12" fill="white"/>
      </clipPath>
    </defs>
  </svg>
</th>
<th data-type="updatedAt" class="clients__table-updateat clients__table-sort-color">
  ${"Последние <br> изменения"}
  <svg class="clients__table-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_221_919)">
      <path d="M10 6L9.295 5.295L6.5 8.085L6.5 2H5.5L5.5 8.085L2.71 5.29L2 6L6 10L10 6Z" fill="#9873FF"/>
    </g>
    <defs>
      <clipPath id="clip0_221_919">
      <rect width="12" height="12" fill="white"/>
      </clipPath>
    </defs>
  </svg>
</th>
<th class="event-none">${"Контакты"}</th>
<th class="event-none">${"Действия"}</th>`
const inputBlockInnerHtml = `
<div class="modal__contacts-select-wrapper">
  <select name="select" class="modal__contacts-select multiple-select">
  </select>
</div>
<input class="modal__contacts-input" type="tel" placeholder="Введите данные контакта"
aria-label="введите ваше отчество">
<div class="modal__contacts-input-delete">
  <svg class="modal__contacts-input-delete-icon" width="16" height="16" viewbox="0 0 16 16" fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.7" clip-path="url(#clip0_216_224)">
      <path
          d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z"
          fill="#B0B0B0" />
    </g>
    <defs>
      <clippath id="clip0_216_224">
        <rect width="16" height="16" fill="white" />
      </clippath>
    </defs>
  </svg>
</div>
`;
const inputBlockInnerHtmlCard = `
<div class="modal__contacts-select-wrapper">
  <select name="select" class="modal__contacts-select multiple-select">
  </select>
</div>
<input class="modal__contacts-input input-card" readonly type="tel" placeholder="Введите данные контакта"
aria-label="введите ваше отчество">
`;

let choices0, choices1, choices2, choices3, choices4, choices5,
choices6, choices7, choices8, choices9;
let unformattedMask;
let bodyJSONRequest;
let deleteBtns;
let selectInputs;
let studenDataById;
let idToChange;
let mailErrorCount = 0;
let phoneErrorCount = 0;
let columnDir = false;
let fio;
let editStudentSurname = document.querySelector(".surname-edit");
let editStudentName = document.querySelector(".name-edit");
let editStudentLastName = document.querySelector(".lastname-edit");
let editStudentId = document.querySelector(".modal__heading-edit-id");
let newStudentName = document.querySelector(".name");
let newStudentSurname = document.querySelector(".surname");
let newStudentLastName = document.querySelector(".lastname");
let choicesValues = document.querySelectorAll(".choices");
let tableNameContentLink = document.querySelectorAll(".clients__table-name-content-link");
let contactBlocks = document.querySelectorAll(".modal__contacts-container");

// // создаём TH таблицы
tableContainer.innerHTML = createTableInnerHtml;
const tableHeadingContainer = document.querySelector('.clients__table-heading-container');
const table = document.querySelector(".clients__table");
const tbody = document.createElement("tbody");
tableHeading.classList.add("clients__table-heading")
tableHeading.innerHTML = tableHeadingInnerHtml;
tableHeadingContainer.appendChild(tableHeading)
const tableId = document.querySelector(".clients__table-id");

addStudentCardStart()
createStudentList()
