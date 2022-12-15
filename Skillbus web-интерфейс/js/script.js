const formatTime = (el) => {
  el = String(el.split("T")[0].split("-").reverse()).split(",").join(".")
  return el
}

const deleteStudent = async (id) => {
  const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
    method: "DELETE",
  })
  if (response.status === 404) console.log("Что-то пошло не так...")
}

const EMAIL_REGEXP =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu

const isEmailValid = (value) => {
  return EMAIL_REGEXP.test(value)
}

const changeStudentItem = async (id, bodyJSONRequest) => {
  const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(bodyJSONRequest),
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (response.status === 404) console.log("Что-то пошло не так...")
  if (response.status === 422) {
    errorEmptyEdit.classList.add("is-active")
    modalAddContainerAddBtn.style.marginBottom = "0px"
  }
}

const modal = new GraphModal()
const tableContainer = document.querySelector(".clients__table-container")
const tableHeading = document.createElement("tr")
const inputBlock = document.createElement("div")
const saveBtn = document.querySelector(".save-new")
const modalAddContainer = document.querySelector(
  ".modal__contacts-main-container"
)
const modalAddContainerAddBtn = document.querySelector(
  ".modal__form-btn-container-add"
)
const modalAddContainerEdit = document.querySelector(
  ".modal__contacts-main-container-edit"
)
const modalAddContainerEditBtn = document.querySelector(
  ".modal__form-btn-container-edit"
)
let newStudentName
let newStudentSurname
let newStudentLastName
let unformattedMask
let bodyJSONRequest
let choices

tableContainer.innerHTML = `
<table class="clients__table">
  <thead class="clients__table-heading-container"></thead>
</table>`

// создаём TH таблицы
tableHeading.classList.add("clients__table-heading")
tableHeading.innerHTML = `
<th data-type="integer" class="clients__table-id clients__table-sort-color">
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
<th data-type="text" class="clients__table-name clients__table-sort-color">
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
<th data-type="date" class="clients__table-createat clients__table-sort-color">
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
<th data-type="date" class="clients__table-updateat clients__table-sort-color">
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

document
  .querySelector(".clients__table-heading-container")
  .appendChild(tableHeading)

const createStudentList = async () => {
  const response = await fetch(`http://localhost:3000/api/clients`)
  const data = await response.json()

  const table = document.querySelector(".clients__table")
  const tbody = document.createElement("tbody")
  tbody.classList.add("clients__table-tbody")
  table.appendChild(tbody)

  //заполняется таблица

  for (key in data) {
    let row = document.createElement("tr")

    //добавляются id, ФИО, Дата создания, Дата посл. изменения
    row.innerHTML = `
      <td class="clients__table-id-content">${data[key].id}</td>
      <td class="clients__table-name-content">${
        data[key].surname + " " + data[key].name + " " + data[key].lastName
      }</td>

      <td>${formatTime(data[key].createdAt)}
        <span class="clients__table-date-time">${data[key].createdAt.slice(
          11,
          16
        )}</span>
      </td>

      <td class="clients__table-update-content">${formatTime(
        data[key].updatedAt
      )}
        <span class="clients__table-date-time">${data[key].updatedAt.slice(
          11,
          16
        )}</span>
      </td>
    `

    // добавляются контакты студента

    const contacts = document.createElement("td")

    contacts.classList.add("clients__table-contacts-content")
    row.append(contacts)

    for (let i = 0; i < data[key].contacts.length; i++) {
      if (data[key].contacts[i].type === "vk") {
        contacts.innerHTML += `
      <td class="clients__table-contacts-content">
        <a class="clients__table-contacts-content-link" tooltip="Vk: @${data[
          key
        ].contacts[i].value.substr(15)}" tooltip-position="top" href="${
          data[key].contacts[i].value
        }">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.7">
              <path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#B79DFF"/>
            </g>
          </svg>
        </a>
      </td>
      `
      }

      if (data[key].contacts[i].type === "Facebook") {
        contacts.innerHTML += `
      <td class="clients__table-contacts-content">
        <a class="clients__table-contacts-content-link" tooltip="Facebook: @${data[
          key
        ].contacts[i].value.substr(15)}" tooltip-position="top" href="${
          data[key].contacts[i].value
        }">
         <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
           <g opacity="0.7">
             <path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#B79DFF"/>
           </g>
         </svg>
        </a>
       </td>
      `
      }

      if (data[key].contacts[i].type === "Телефон") {
        let contactTelTooltip = data[key].contacts[i].value.substr(4)
        contactTelTooltip = `${contactTelTooltip.substr(
          0,
          2
        )} (${contactTelTooltip.substr(2, 3)}) ${contactTelTooltip.substr(
          5,
          3
        )}-${contactTelTooltip.substr(8, 2)}-${contactTelTooltip.substr(10, 2)}`

        contacts.innerHTML += `
      <td class="clients__table-contacts-content">
        <a class="clients__table-contacts-content-link-phone" tooltip="${contactTelTooltip}" tooltip-position="top" href="${data[key].contacts[i].value}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.7">
              <circle cx="8" cy="8" r="8" fill="#B79DFF"/>
              <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/>
            </g>
          </svg>
        </a>
      </td>
      `
      }

      if (data[key].contacts[i].type === "Email") {
        contacts.innerHTML += `
      <td class="clients__table-contacts-content">
        <a class="clients__table-contacts-content-link" tooltip="${data[
          key
        ].contacts[i].value.substr(7)}" tooltip-position="top" href="${
          data[key].contacts[i].value
        }">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#B79DFF"/>
          </svg>
        </a>
      </td>
      `
      }

      if (data[key].contacts[i].type === "twitter") {
        contacts.innerHTML += `
      <td class="clients__table-contacts-content">
        <a class="clients__table-contacts-content-link" tooltip="Twitter: @${data[
          key
        ].contacts[i].value.substr(20)}" tooltip-position="top" href="${
          data[key].contacts[i].value
        }">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#B79DFF"/>
          </svg>
        </a>
      </td>
      `
      }

      if (data[key].contacts[i].type === "AdditionalPhone") {
        let contactTelAddTooltip = data[key].contacts[i].value.substr(4)
        contactTelAddTooltip = `${contactTelAddTooltip.substr(
          0,
          2
        )} (${contactTelAddTooltip.substr(2, 3)}) ${contactTelAddTooltip.substr(
          5,
          3
        )}-${contactTelAddTooltip.substr(8, 2)}-${contactTelAddTooltip.substr(
          10,
          2
        )}`
        contacts.innerHTML += `
      <td class="clients__table-contacts-content">
        <a class="clients__table-contacts-content-link" tooltip="&nbsp;&nbsp;Доп. телефон: &nbsp;&nbsp; ${contactTelAddTooltip}" tooltip-position="top" href="${data[key].contacts[i].value}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#B79DFF"/>
          </svg>
        </a>
      </td>
      `
      }

      if (data[key].contacts[i].type === "Other") {
        contacts.innerHTML += `
      <td class="clients__table-contacts-content">
        <a class="clients__table-contacts-content-link" tooltip="${data[key].contacts[i].value}" tooltip-position="top" href="${data[key].contacts[i].value}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#B79DFF"/>
          </svg>
        </a>
      </td>
      `
      }
    }

    // добавляются кнопки Изменить и Удалить

    row.innerHTML += `
      <td>
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
    `

    tbody.appendChild(row)
    // document.querySelector(".clients__table-tbody").appendChild(row);
  }

  // создаются кнопки, раскрывающиея контакты, когда их больше 4х
  document
    .querySelectorAll(".clients__table-contacts-content")
    .forEach((el) => {
      if (el.children.length > 4) {
        el.innerHTML += `<button class="clients__table-contacts-content-btn">+${
          el.children.length - 4
        }<button>`
        for (let i = 4; i < el.children.length; i++) {
          el.children[i].style.display = "none"
        }

        // настраиваются события нажатия этих кнопок
        let showBtns = document.querySelectorAll(
          ".clients__table-contacts-content-btn"
        )
        showBtns.forEach((elem) => {
          elem.style.display = "inline-block"
          elem.addEventListener("click", (e) => {
            e.preventDefault()

            for (let i = 0; i < e.target.parentElement.children.length; i++) {
              if (e.target.parentElement.children[i].tagName !== "BUTTON") {
                e.target.parentElement.children[i].style.display =
                  "inline-block"
              } else {
                e.target.parentElement.children[i].style.display = "none"
              }
            }
          })
        })
      }
    })

  let inputValidate = document.querySelectorAll(".input-validate")

  inputValidate.forEach((el) => {
    el.onkeydown = (e) => {
      return !/^[0-9=!"№;%:?*,_\'\\|\{\}\[\]()<>/+@#$%^&.`~A-Za-z]$/.test(e.key) // IE > 9
    }
    el.oninput = () => {
      if (el.value.charAt(0) === " " || el.value.charAt(0) === "-") {
        el.value = ""
      }
      console.log("e")
    }
  })

  // сортировка студентов

  let colIndex = -1

  const sortTable = (index, type, isSorted) => {
    const compare = (rowA, rowB) => {
      let rowDataA = rowA.cells[index].innerHTML
      let rowDataB = rowB.cells[index].innerHTML

      switch (type) {
        case "integer":
          return rowDataA - rowDataB

        case "date":
          let dateA = rowDataA.split("\n")[0]
          let dateATime = rowDataA.split(">")[1]
          dateATime = dateATime.split("<")[0]
          dateATime = dateATime.split(":")
          dateA = dateA.split(".")
          dateA = dateA.reverse()
          dateA = dateA.concat(dateATime)
          dateA = String(dateA)
          dateA = dateA.split(",").join("")

          let dateB = rowDataB.split("\n")[0]
          let dateBTime = rowDataB.split(">")[1]
          dateBTime = dateBTime.split("<")[0]
          dateBTime = dateBTime.split(":")
          dateB = dateB.split(".")
          dateB = dateB.reverse()
          dateB = dateB.concat(dateBTime)
          dateB = String(dateB)
          dateB = dateB.split(",").join("")

          return dateA - dateB

        case "text":
          if (rowDataA < rowDataB) return -1
          else if (rowDataA > rowDataB) return 1
          return 0
      }
    }

    let rows = [].slice.call(tbody.rows)
    rows.sort(compare)
    if (isSorted) rows.reverse()
    table.removeChild(tbody)

    for (let i = 0; i < rows.length; i++) {
      tbody.appendChild(rows[i])
    }
    table.appendChild(tbody)
  }

  const tableId = document.querySelector(".clients__table-id")

  table.addEventListener("click", (e) => {
    const el = e.target

    if (el.nodeName !== "TH") return
    const index = el.cellIndex
    const type = el.getAttribute("data-type")
    sortTable(index, type, colIndex === index)
    colIndex = colIndex === index ? -1 : index

    const tableName = document.querySelector(".clients__table-name")
    const tableNameSort = document.querySelector(".clients__table-name-sort")
    const tableCreateAt = document.querySelector(".clients__table-createat")
    const tableUpdateAt = document.querySelector(".clients__table-updateat")

    // поворот стрелочек и цвет заголовков для TH
    if (el === tableId) {
      tableName.classList.remove("sort-text")
      tableCreateAt.classList.remove("sort-text")
      tableUpdateAt.classList.remove("sort-text")
      tableNameSort.classList.remove("opacity-1")

      tableName.children[1].classList.remove("arrow-flips")
      tableCreateAt.children[1].classList.remove("arrow-flips")
      tableUpdateAt.children[1].classList.remove("arrow-flips")

      el.children[0].classList.toggle("arrow-flips")
      el.children[0].classList.add("opacity-1")
      el.classList.add("sort-text")
    } else if (el === tableName) {
      tableId.classList.remove("sort-text")
      tableCreateAt.classList.remove("sort-text")
      tableUpdateAt.classList.remove("sort-text")

      tableId.children[0].classList.remove("arrow-flips")
      tableCreateAt.children[1].classList.remove("arrow-flips")
      tableUpdateAt.children[1].classList.remove("arrow-flips")

      el.children[1].classList.toggle("arrow-flips")
      el.children[1].classList.add("opacity-1")
      el.classList.add("sort-text")
      tableNameSort.classList.add("opacity-1")
    } else if (el === tableCreateAt) {
      tableId.classList.remove("sort-text")
      tableName.classList.remove("sort-text")
      tableUpdateAt.classList.remove("sort-text")
      tableNameSort.classList.remove("opacity-1")

      tableId.children[0].classList.remove("arrow-flips")
      tableName.children[1].classList.remove("arrow-flips")
      tableUpdateAt.children[1].classList.remove("arrow-flips")

      el.children[1].classList.toggle("arrow-flips")
      el.children[1].classList.add("opacity-1")
      el.classList.add("sort-text")
    } else if (el === tableUpdateAt) {
      tableId.classList.remove("sort-text")
      tableName.classList.remove("sort-text")
      tableCreateAt.classList.remove("sort-text")
      tableNameSort.classList.remove("opacity-1")

      tableId.children[0].classList.remove("arrow-flips")
      tableName.children[1].classList.remove("arrow-flips")
      tableCreateAt.children[1].classList.remove("arrow-flips")

      el.children[1].classList.toggle("arrow-flips")
      el.children[1].classList.add("opacity-1")
      el.classList.add("sort-text")
    }
  })

  // сортируем по ID при запуске

  tableId.click()

  // фильтрация студентов с таймаутом 300мс
  const searchTable = () => {
    let headerForm = document.querySelector(".header__search")

    headerForm.onkeyup = () => {
      setTimeout(() => {
        let fullName = headerForm.elements[0].value

        for (let i = 1; i < table.rows.length; i++) {
          table.rows[i].classList.remove("hide")

          if (table.rows[i].cells[1].innerHTML.indexOf(fullName) == -1) {
            table.rows[i].classList.add("hide")
          }
        }
      }, 300)
    }
  }

  searchTable()

  /// модальное окно Добавить нового студента

  // при нажатии добавляется контакт студента (селект и импут для ввода)
  let deleteBtns
  let selectInput
  const addClientButton = document.querySelector(".modal__form-btn-add")

  Inputmask({
    mask: "+7 (999)-999-99-99",
  }).mask(document.querySelectorAll(".modal__contacts-input"))

  inputBlock.classList.add("modal__contacts-container")
  inputBlock.innerHTML = `
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
  `

  addClientButton.addEventListener("click", (e) => {
    e.preventDefault()

    let contactBlocks = document.querySelectorAll(".modal__contacts-container")

    if (contactBlocks.length <= 9) {
      document
        .querySelector(".modal__contacts-main-container")
        .appendChild(inputBlock.cloneNode(true))
    }

    // добавляются паддинги к кнопке и блоку Добавить контакт

    if (contactBlocks.length >= 0) {
      modalAddContainer.classList.add("pt-25")
      modalAddContainerAddBtn.classList.add("pb-25")
    }

    // отключаем кнопку, когда контактов становится 10
    if (contactBlocks.length === 9) addClientButton.setAttribute("disabled", "")

    selectInput = document.querySelectorAll(".modal__contacts-select")

    selectInput.forEach((el, index) => {
      choices = new Choices(el, {
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
      })

      let selectorInput // использовать только при переборе массива (здесь)
      selectorInput =
        el.parentElement.parentElement.parentElement.parentElement.children[1]

      // делаем маску для нового контакта при нажатии Добавить новый контакт (маска по дефолту до выбора селекта)
      if (index === selectInput.length - 1) {
        Inputmask("tel", {
          mask: "+7 (999)-999-99-99",
        }).mask(selectorInput)
      }

      el.addEventListener("change", () => {
        selectValue = el.value

        if (selectValue === "Телефон" || selectValue === "AdditionalPhone") {
          selectorInput.type = "tel"
          Inputmask("tel", {
            mask: "+7 (999)-999-99-99",
          }).mask(selectorInput)
        } else if (selectValue === "Email") {
          selectorInput.type = "email"
          if (selectorInput.inputmask) {
            selectorInput.inputmask.remove()
          }
        } else if (selectValue === "vk") {
          selectorInput.type = "url"
          if (selectorInput.inputmask) {
            selectorInput.inputmask.remove()
          }
          Inputmask("url", {
            mask: "https://vk.com/*{1,20}",
          }).mask(selectorInput)
        } else if (selectValue === "Facebook") {
          selectorInput.type = "url"
          if (selectorInput.inputmask) {
            selectorInput.inputmask.remove()
          }

          Inputmask("url", {
            mask: "https://fb.com/*{1,20}",
          }).mask(selectorInput)
        } else if (selectValue === "twitter") {
          selectorInput.type = "url"
          if (selectorInput.inputmask) {
            selectorInput.inputmask.remove()
          }
          Inputmask("url", {
            mask: "https://twitter.com/*{1,20}",
          }).mask(selectorInput)
        } else if (selectValue === "Other") {
          selectorInput.type = "url"
          if (selectorInput.inputmask) {
            selectorInput.inputmask.remove()
          }
        }
      })
    })

    choicesValues = document.querySelectorAll(".choices")

    // удаляем контакт
    deleteBtns = document.querySelectorAll(".modal__contacts-input-delete")
    deleteBtns.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.target.parentElement.remove()
        addClientButton.removeAttribute("disabled")
        choicesValues = document.querySelectorAll(".choices")
        contactBlocks = document.querySelectorAll(".modal__contacts-container")

        errorEmail.classList.remove("is-active")
        errorPhone.classList.remove("is-active")
        modalAddContainerAddBtn.classList.add("mb-25")
        if (!contactBlocks.length) {
          modalAddContainerAddBtn.classList.remove("pb-25")
          modalAddContainer.classList.remove("pt-25")
        }
      })
    })
  })

  // удаляется студент при нажатии кнопки Удалить в таблице

  let idToDelete
  setTimeout(() => {
    document.querySelectorAll(".clients__table-delete-content").forEach((e) => {
      e.addEventListener("click", () => {
        idToDelete = e.parentElement.parentElement.childNodes[1].innerHTML
      })
    })
    document
      .querySelector(".modal__form-btn-delete-main")
      .addEventListener("click", () => {
        deleteStudent(idToDelete)
      })
  }, 500)

  // удаляется студент при нажатии кнопки Изменить => Удалить студента
  let deleteBtnInEdit = document.querySelector(".modal__form-btn-edit-delete")
  setTimeout(() => {
    deleteBtnInEdit.addEventListener("click", (e) => {
      e.preventDefault()
      idToDelete =
        e.target.parentElement.parentElement.parentElement.children[1].innerHTML.split(
          " "
        )[1]
      document
        .querySelector(".modal__form-btn-delete-main")
        .addEventListener("click", () => {
          deleteStudent(idToDelete)
        })
    })
  }, 500)

  // создаём нового студента

  choicesValues = document.querySelectorAll(".choices")
  newStudentName = document.querySelector(".name")
  newStudentSurname = document.querySelector(".surname")
  newStudentLastName = document.querySelector(".lastname")
  errorSurname = document.querySelector(".error-surname")
  errorName = document.querySelector(".error-name")
  errorPhone = document.querySelector(".error-phone")
  errorEmail = document.querySelector(".error-email")

  // валидация инпута во время ввода

  newStudentName.addEventListener("input", () => {
    if (newStudentName.value.length >= 2 && newStudentName.value.length <= 20) {
      errorName.classList.remove("is-active")
      newStudentName.style.borderColor = "#C8C5D1"
      modalAddContainerAddBtn.style.marginBottom = "25px"
    } else {
      errorName.classList.add("is-active")
      modalAddContainerAddBtn.style.marginBottom = "0"
      newStudentName.style.borderColor = "#F06A4D"
    }
  })

  newStudentSurname.addEventListener("input", () => {
    if (
      newStudentSurname.value.length >= 2 &&
      newStudentSurname.value.length <= 20
    ) {
      errorSurname.classList.remove("is-active")
      newStudentSurname.style.borderColor = "#C8C5D1"
      modalAddContainerAddBtn.style.marginBottom = "25px"
    } else {
      errorSurname.classList.add("is-active")
      modalAddContainerAddBtn.style.marginBottom = "0"
      newStudentSurname.style.borderColor = "#F06A4D"
    }
  })

  // валидация инпутов при нажатии Сохранить
  saveBtn.addEventListener("click", (ele) => {
    ele.preventDefault()

    newStudentName = document.querySelector(".name")
    newStudentSurname = document.querySelector(".surname")
    newStudentLastName = document.querySelector(".lastname")
    let mailErrorCount = 0
    let phoneErrorCount = 0

    if (
      newStudentName.value.length >= 2 &&
      newStudentName.value.length <= 20 &&
      newStudentSurname.value.length >= 2 &&
      newStudentSurname.value.length <= 20
    ) {
      // форматируем вводимые данные в ФИО
      newStudentName = newStudentName.value.trim()
      newStudentSurname = newStudentSurname.value.trim()

      newStudentName =
        newStudentName[0].toUpperCase() + newStudentName.slice(1).toLowerCase()
      newStudentSurname =
        newStudentSurname[0].toUpperCase() +
        newStudentSurname.slice(1).toLowerCase()

      if (newStudentLastName.value !== "") {
        newStudentLastName.value = newStudentLastName.value.trim()
        newStudentLastName.value =
          newStudentLastName.value[0].toUpperCase() +
          newStudentLastName.value.slice(1).toLowerCase()
      }

      let selectTypesArr = []
      let inputTypesArr = []
      choicesValues.forEach((elem) => {
        selectTypesArr.push(elem.children[0].children[0].value)
        inputTypesArr.push(elem.parentElement.parentElement.children[1].value)
      })

      bodyJSONRequest = {
        surname: newStudentSurname,
        name: newStudentName,
        lastName: newStudentLastName.value,
        contacts: [],
      }

      for (let i = 0; i < selectTypesArr.length; i++) {
        if (
          selectTypesArr[i] === "Телефон" ||
          selectTypesArr[i] === "AdditionalPhone"
        ) {
          unformattedMask = Inputmask.unmask(inputTypesArr[i], {
            mask: "+7 (999)-999-99-99",
          })

          // проверяем валидность Телефон

          if (unformattedMask.length !== 10) {
            phoneErrorCount++
          }

          inputTypesArr[i] = `tel:+7${unformattedMask}`
        } else if (selectTypesArr[i] === "Email") {
          // проверяем валидность Email

          if (isEmailValid(inputTypesArr[i]) === false) {
            mailErrorCount++
          }

          inputTypesArr[i] = `mailto:${inputTypesArr[i]}`
        } else {
          inputTypesArr[i] = inputTypesArr[i]
        }

        bodyJSONRequest.contacts[i] = {
          type: selectTypesArr[i],
          value: inputTypesArr[i],
        }
      }

      const errorEmpty = document.querySelector(".error-empty")

      const createStudentItemMulti = async () => {
        const response = await fetch("http://localhost:3000/api/clients", {
          method: "POST",
          body: JSON.stringify(bodyJSONRequest),
          headers: {
            "Content-Type": "application/json",
          },
        })
        if (response.status === 422) {
          errorEmpty.classList.add("is-active")
          modalAddContainerAddBtn.style.marginBottom = "0px"
        }
      }

      if (mailErrorCount !== 0) {
        modalAddContainerAddBtn.style.marginBottom = "0px"
        errorEmail.classList.add("is-active")
      } else {
        errorEmail.classList.remove("is-active")
        modalAddContainerAddBtn.style.marginBottom = "25px"
      }
      if (phoneErrorCount !== 0) {
        errorPhone.classList.add("is-active")
        modalAddContainerAddBtn.style.marginBottom = "0"
      } else {
        errorPhone.classList.remove("is-active")
        modalAddContainerAddBtn.style.marginBottom = "25px"
      }

      if (mailErrorCount === 0 && phoneErrorCount === 0) {
        createStudentItemMulti()
      }
    } else {
      if (
        newStudentName.value.length >= 2 &&
        newStudentName.value.length <= 20
      ) {
        errorName.classList.remove("is-active")
        newStudentName.style.borderColor = "#C8C5D1"
        modalAddContainerAddBtn.style.marginBottom = "25px"
      } else {
        errorName.classList.add("is-active")
        modalAddContainerAddBtn.style.marginBottom = "0"
        newStudentName.style.borderColor = "#F06A4D"
      }

      if (
        newStudentSurname.value.length >= 2 &&
        newStudentSurname.value.length <= 20
      ) {
        errorSurname.classList.remove("is-active")
        newStudentSurname.style.borderColor = "#C8C5D1"
        modalAddContainerAddBtn.style.marginBottom = "25px"
      } else {
        errorSurname.classList.add("is-active")
        modalAddContainerAddBtn.style.marginBottom = "0"
        newStudentSurname.style.borderColor = "#F06A4D"
      }
    }
  })

  // изменяем данные студента

  // находим id студента для изменения
  let studentItemInData
  let idToChange
  let editStudentSurname = document.querySelector(".surname-edit")
  let editStudentName = document.querySelector(".name-edit")
  let editStudentLastName = document.querySelector(".lastname-edit")
  let editStudentId = document.querySelector(".modal__heading-edit-id")

  document.querySelectorAll(".clients__table-edit-text").forEach((e) => {
    e.addEventListener("click", () => {
      idToChange =
        e.parentElement.parentElement.parentElement.children[0].innerHTML

      for (let i = 0; i < data.length; i++) {
        if (idToChange == data[i].id) {
          studentItemInData = data[i]
        }
      }

      // заполняем окно Изменить данные при открытии

      editStudentSurname.value = studentItemInData.surname
      editStudentName.value = studentItemInData.name
      editStudentLastName.value = studentItemInData.lastName
      editStudentId.innerHTML = `ID: ${studentItemInData.id}`

      // запускаем кнопку удаления контакта
      setTimeout(() => {
        deleteBtns = document.querySelectorAll(".modal__contacts-input-delete")
        deleteBtns.forEach((el) => {
          el.addEventListener("click", (e) => {
            e.target.parentElement.remove()
            addClientButton.removeAttribute("disabled")
            choicesValues = document.querySelectorAll(".choices")
          })
        })
      }, 500)

      // добавляем имеющиеся контакты из базы

      inputBlock.classList.add("modal__contacts-container")
      inputBlock.innerHTML = `
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
        `

      // создаём массивы с селекторами и их значениями для контактов
      for (let i = 0; i < studentItemInData.contacts.length; i++) {
        document
          .querySelector(".modal__contacts-main-container-edit")
          .appendChild(inputBlock.cloneNode(true))
      }

      let selectTypeArr = []
      let inputValueArr = []
      for (let i = 0; i < studentItemInData.contacts.length; i++) {
        selectTypeArr.push(studentItemInData.contacts[i].type)

        if (
          studentItemInData.contacts[i].value[0] === "m" ||
          studentItemInData.contacts[i].value[0] === "t"
        ) {
          inputValueArr.push(studentItemInData.contacts[i].value.split(":")[1])
        } else inputValueArr.push(studentItemInData.contacts[i].value)
      }

      // инициируем choices для каждого созданного контакта
      selectInput = document.querySelectorAll(".modal__contacts-select")
      selectInput.forEach((el, index) => {
        choices = new Choices(el, {
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
        })

        let selectorInput // использовать только при переборе массива (здесь)
        selectorInput =
          el.parentElement.parentElement.parentElement.parentElement.children[1]

        // выставляем выбор селекта и значение инпута у новых choices
        if (index === 0) {
          choices.setChoiceByValue(selectTypeArr[index])
          selectorInput.value = inputValueArr[index]
        } else if (index === 1) {
          choices.setChoiceByValue(selectTypeArr[index])
          selectorInput.value = inputValueArr[index]
        } else if (index === 2) {
          choices.setChoiceByValue(selectTypeArr[index])
          selectorInput.value = inputValueArr[index]
        } else if (index === 3) {
          choices.setChoiceByValue(selectTypeArr[index])
          selectorInput.value = inputValueArr[index]
        } else if (index === 4) {
          choices.setChoiceByValue(selectTypeArr[index])
          selectorInput.value = inputValueArr[index]
        } else if (index === 5) {
          choices.setChoiceByValue(selectTypeArr[index])
          selectorInput.value = inputValueArr[index]
        } else if (index === 6) {
          choices.setChoiceByValue(selectTypeArr[index])
          selectorInput.value = inputValueArr[index]
        } else if (index === 7) {
          choices.setChoiceByValue(selectTypeArr[index])
          selectorInput.value = inputValueArr[index]
        } else if (index === 8) {
          choices.setChoiceByValue(selectTypeArr[index])
          selectorInput.value = inputValueArr[index]
        } else if (index === 9) {
          choices.setChoiceByValue(selectTypeArr[index])
          selectorInput.value = inputValueArr[index]
        }

        el.addEventListener("change", () => {
          selectValue = el.value

          if (selectValue === "Телефон" || selectValue === "AdditionalPhone") {
            selectorInput.type = "tel"
            Inputmask("tel", {
              mask: "+7 (999)-999-99-99",
            }).mask(selectorInput)
          } else if (selectValue === "Email") {
            selectorInput.type = "email"
            if (selectorInput.inputmask) {
              selectorInput.inputmask.remove()
            }
          } else if (selectValue === "vk") {
            selectorInput.type = "url"
            if (selectorInput.inputmask) {
              selectorInput.inputmask.remove()
            }
            Inputmask("url", {
              mask: "https://vk.com/*{1,20}",
            }).mask(selectorInput)
          } else if (selectValue === "Facebook") {
            selectorInput.type = "url"
            if (selectorInput.inputmask) {
              selectorInput.inputmask.remove()
            }

            Inputmask("url", {
              mask: "https://fb.com/*{1,20}",
            }).mask(selectorInput)
          } else if (selectValue === "twitter") {
            selectorInput.type = "url"
            if (selectorInput.inputmask) {
              selectorInput.inputmask.remove()
            }
            Inputmask("url", {
              mask: "https://twitter.com/*{1,20}",
            }).mask(selectorInput)
          } else if (selectValue === "Other") {
            selectorInput.type = "url"
            if (selectorInput.inputmask) {
              selectorInput.inputmask.remove()
            }
          }
        })

        // удаляем контакт
        deleteBtns = document.querySelectorAll(".modal__contacts-input-delete")
        deleteBtns.forEach((el) => {
          el.addEventListener("click", (e) => {
            e.target.parentElement.remove()
            addClientBtnInEdit.removeAttribute("disabled")
            choicesValues = document.querySelectorAll(".choices")
            contactBlocks = document.querySelectorAll(
              ".modal__contacts-container"
            )
            if (!contactBlocks.length) {
              modalAddContainerEdit.classList.remove("pt-25")
              modalAddContainerEditBtn.classList.remove("pb-25")
            }
          })
        })
      })
      contactBlocks = document.querySelectorAll(".modal__contacts-container")
      if (contactBlocks.length > 0) {
        modalAddContainerEdit.classList.add("pt-25")
        modalAddContainerEditBtn.classList.add("pb-25")
      }
    })
  })

  let addClientBtnInEdit = document.querySelector(
    ".modal__form-btn-add-in-edit"
  )
  addClientBtnInEdit.addEventListener("click", (e) => {
    e.preventDefault()

    contactBlocks = document.querySelectorAll(".modal__contacts-container")

    if (contactBlocks.length >= 0) {
      modalAddContainerEdit.classList.add("pt-25")
      modalAddContainerEditBtn.classList.add("pb-25")
    }

    if (contactBlocks.length <= 9) {
      document
        .querySelector(".modal__contacts-main-container-edit")
        .appendChild(inputBlock.cloneNode(true))
    }

    // отключаем кнопку, когда контактов становится 10
    if (contactBlocks.length === 9)
      addClientBtnInEdit.setAttribute("disabled", "")

    selectInput = document.querySelectorAll(".modal__contacts-select")

    selectInput.forEach((el, index) => {
      choices = new Choices(el, {
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
      })

      let selectorInput // использовать только при переборе массива (здесь)
      selectorInput =
        el.parentElement.parentElement.parentElement.parentElement.children[1]

      // делаем маску для нового контакта при нажатии Добавить новый контакт (маска по дефолту до выбора селекта)
      if (index === selectInput.length - 1) {
        Inputmask("tel", {
          mask: "+7 (999)-999-99-99",
        }).mask(selectorInput)
      }

      el.addEventListener("change", () => {
        selectValue = el.value

        if (selectValue === "Телефон" || selectValue === "AdditionalPhone") {
          selectorInput.type = "tel"
          Inputmask("tel", {
            mask: "+7 (999)-999-99-99",
          }).mask(selectorInput)
        } else if (selectValue === "Email") {
          selectorInput.type = "email"
          if (selectorInput.inputmask) {
            selectorInput.inputmask.remove()
          }
        } else if (selectValue === "vk") {
          selectorInput.type = "url"
          if (selectorInput.inputmask) {
            selectorInput.inputmask.remove()
          }
          Inputmask("url", {
            mask: "https://vk.com/*{1,20}",
          }).mask(selectorInput)
        } else if (selectValue === "Facebook") {
          selectorInput.type = "url"
          if (selectorInput.inputmask) {
            selectorInput.inputmask.remove()
          }

          Inputmask("url", {
            mask: "https://fb.com/*{1,20}",
          }).mask(selectorInput)
        } else if (selectValue === "twitter") {
          selectorInput.type = "url"
          if (selectorInput.inputmask) {
            selectorInput.inputmask.remove()
          }
          Inputmask("url", {
            mask: "https://twitter.com/*{1,20}",
          }).mask(selectorInput)
        } else if (selectValue === "Other") {
          selectorInput.type = "url"
          if (selectorInput.inputmask) {
            selectorInput.inputmask.remove()
          }
        }
      })

      choicesValues = document.querySelectorAll(".choices")

      // удаляем контакт
      deleteBtns = document.querySelectorAll(".modal__contacts-input-delete")
      deleteBtns.forEach((el) => {
        el.addEventListener("click", (e) => {
          e.target.parentElement.remove()
          addClientBtnInEdit.removeAttribute("disabled")
          choicesValues = document.querySelectorAll(".choices")
          contactBlocks = document.querySelectorAll(
            ".modal__contacts-container"
          )
          if (!contactBlocks.length) {
            modalAddContainerEdit.classList.remove("pt-25")
            modalAddContainerEditBtn.classList.remove("pb-25")
          }
        })
      })
    })
  })

  // очищаем контакты студента при закрытии модального окна
  modal.modal.addEventListener("mouseleave", () => {
    document.querySelectorAll(".modal__contacts-container").forEach((e) => {
      e.remove()
    })
    addClientBtnInEdit.removeAttribute("disabled")
    addClientButton.removeAttribute("disabled")
    document.querySelector(".surname").value = ""
    document.querySelector(".name").value = ""
    document.querySelector(".lastname").value = ""
    modalAddContainerAddBtn.classList.remove("pb-25")
    modalAddContainer.classList.remove("pt-25")
    modalAddContainerEdit.classList.remove("pt-25")
    modalAddContainerEditBtn.classList.remove("pb-25")
  })

  // валидация инпута во время ввода в Измениить контакт

  modalAddContainerAddBtnEdit = document.querySelector(
    ".modal__form-btn-container-edit"
  )
  errorSurnameEdit = document.querySelector(".error-surname-edit")
  errorNameEdit = document.querySelector(".error-name-edit")
  errorPhoneEdit = document.querySelector(".error-phone-edit")
  errorEmailEdit = document.querySelector(".error-email-edit")
  errorEmptyEdit = document.querySelector(".error-empty-edit")

  editStudentName.addEventListener("input", () => {
    if (
      editStudentName.value.length >= 2 &&
      editStudentName.value.length <= 20
    ) {
      errorNameEdit.classList.remove("is-active")
      editStudentName.style.borderColor = "#C8C5D1"
      modalAddContainerAddBtnEdit.style.marginBottom = "25px"
    } else {
      errorNameEdit.classList.add("is-active")
      modalAddContainerAddBtnEdit.style.marginBottom = "0"
      editStudentName.style.borderColor = "#F06A4D"
    }
  })

  editStudentSurname.addEventListener("input", () => {
    if (
      editStudentSurname.value.length >= 2 &&
      editStudentSurname.value.length <= 20
    ) {
      errorSurnameEdit.classList.remove("is-active")
      editStudentSurname.style.borderColor = "#C8C5D1"
      modalAddContainerAddBtnEdit.style.marginBottom = "25px"
    } else {
      errorSurnameEdit.classList.add("is-active")
      modalAddContainerAddBtnEdit.style.marginBottom = "0"
      editStudentSurname.style.borderColor = "#F06A4D"
    }
  })

  // валидация инпутов при нажатии Сохранить в Изменить контакт

  const saveEditBtn = document.querySelector(".modal__form-btn-edit")
  saveEditBtn.addEventListener("click", (e) => {
    e.preventDefault()
    editStudentSurname = document.querySelector(".surname-edit")
    editStudentName = document.querySelector(".name-edit")
    editStudentLastName = document.querySelector(".lastname-edit")
    editStudentId = document.querySelector(".modal__heading-edit-id")
    choicesValues = document.querySelectorAll(".choices")

    let mailErrorCount = 0
    let phoneErrorCount = 0

    if (
      editStudentName.value.length >= 2 &&
      editStudentName.value.length <= 20 &&
      editStudentSurname.value.length >= 2 &&
      editStudentSurname.value.length <= 20
    ) {
      // форматируем вводимые данные в ФИО
      editStudentName.value = editStudentName.value.trim()
      editStudentSurname.value = editStudentSurname.value.trim()

      if (editStudentLastName.value !== "") {
        editStudentLastName.value = editStudentLastName.value.trim()
        editStudentLastName.value =
          editStudentLastName.value[0].toUpperCase() +
          editStudentLastName.value.slice(1).toLowerCase()
      }

      editStudentName.value =
        editStudentName.value[0].toUpperCase() +
        editStudentName.value.slice(1).toLowerCase()
      editStudentSurname.value =
        editStudentSurname.value[0].toUpperCase() +
        editStudentSurname.value.slice(1).toLowerCase()

      bodyJSONRequest = {
        surname: editStudentSurname.value,
        name: editStudentName.value,
        lastName: editStudentLastName.value,
        contacts: [],
      }

      let selectTypesArr = []
      let inputTypesArr = []
      choicesValues.forEach((elem) => {
        selectTypesArr.push(elem.children[0].children[0].value)
        inputTypesArr.push(elem.parentElement.parentElement.children[1].value)
      })

      for (let i = 0; i < selectTypesArr.length; i++) {
        if (
          selectTypesArr[i] === "Телефон" ||
          selectTypesArr[i] === "AdditionalPhone"
        ) {
          unformattedMask = Inputmask.unmask(inputTypesArr[i], {
            mask: "+7 (999)-999-99-99",
          })

          // проверяем валидность Телефон в Изменить контакт

          if (unformattedMask.length !== 10) {
            phoneErrorCount++
          }

          inputTypesArr[i] = `tel:+7${unformattedMask}`
        } else if (selectTypesArr[i] === "Email") {
          // проверяем валидность Email в Изменить контакт

          if (isEmailValid(inputTypesArr[i]) === false) {
            mailErrorCount++
          }

          inputTypesArr[i] = `mailto:${inputTypesArr[i]}`
        } else {
          inputTypesArr[i] = inputTypesArr[i]
        }

        bodyJSONRequest.contacts[i] = {
          type: selectTypesArr[i],
          value: inputTypesArr[i],
        }
      }

      if (mailErrorCount !== 0) {
        modalAddContainerAddBtnEdit.style.marginBottom = "0px"
        errorEmailEdit.classList.add("is-active")
      } else {
        errorEmailEdit.classList.remove("is-active")
        modalAddContainerAddBtnEdit.style.marginBottom = "25px"
      }
      if (phoneErrorCount !== 0) {
        errorPhoneEdit.classList.add("is-active")
        modalAddContainerAddBtnEdit.style.marginBottom = "0"
      } else {
        errorPhoneEdit.classList.remove("is-active")
        modalAddContainerAddBtnEdit.style.marginBottom = "25px"
      }

      editStudentId = editStudentId.innerHTML.split(" ")[1]
      if (mailErrorCount === 0 && phoneErrorCount === 0) {
        changeStudentItem(editStudentId, bodyJSONRequest)
      }
    } else {
      if (
        editStudentName.value.length >= 2 &&
        editStudentName.value.length <= 20
      ) {
        errorNameEdit.classList.remove("is-active")
        editStudentName.style.borderColor = "#C8C5D1"
        modalAddContainerAddBtnEdit.style.marginBottom = "25px"
      } else {
        errorNameEdit.classList.add("is-active")
        editStudentName.style.borderColor = "#F06A4D"
        modalAddContainerAddBtnEdit.style.marginBottom = "0"
      }

      if (
        editStudentSurname.value.length >= 2 &&
        editStudentSurname.value.length <= 20
      ) {
        errorSurnameEdit.classList.remove("is-active")
        editStudentSurname.style.borderColor = "#C8C5D1"
        modalAddContainerAddBtnEdit.style.marginBottom = "25px"
      } else {
        errorSurnameEdit.classList.add("is-active")
        modalAddContainerAddBtnEdit.style.marginBottom = "0"
        editStudentSurname.style.borderColor = "#F06A4D"
      }
    }
  })
}

createStudentList()
