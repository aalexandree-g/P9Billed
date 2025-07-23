/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"

import router from "../app/Router.js"
import mockStore from "../__mocks__/store.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    let billsContainer

    test("Then bill icon in vertical layout should be highlighted", async () => {
      // localStorage simulation
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      // connected employee similation
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

      // DOM initialization
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      // environment simulation
      window.onNavigate(ROUTES_PATH.Bills)
      billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      // *** check if class 'active-icon' is correctly affected
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
      // **********
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on new bill button", () => {
      test("Then it should open the new bill form", () => {
        // localStorage simulation
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })

        // connected employee similation
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

        // DOM initialization
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()

        // environment simulation
        window.onNavigate(ROUTES_PATH.Bills)
        billsContainer = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })

        const newBillBtn = screen.getByTestId("btn-new-bill")
        // spy handleClickNewBill function
        const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill)
        // attach function to click
        newBillBtn.addEventListener("click", handleClickNewBill)
        // click simulation
        fireEvent.click(newBillBtn)

        expect(handleClickNewBill).toHaveBeenCalled()
        expect(window.location.hash).toBe(ROUTES_PATH.NewBill)
      })
    })

    describe("When I click on the eye icon", () => {
      test("Then it should open a modal", () => {
        // localStorage simulation
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })

        // connected employee similation
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

        // DOM initialization
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()

        // environment simulation
        window.onNavigate(ROUTES_PATH.Bills)
        billsContainer = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })

        /*$.fn.modal = jest.fn() // mock bootstrap modal

        document.body.innerHTML = BillsUI({ data: bills })
        const iconEye = screen.getAllByTestId("icon-eye")[0]
        const billUrl = iconEye.getAttribute("data-bill-url")

        const handleClickIconEye = jest.fn(() =>
          billsContainer.handleClickIconEye(iconEye)
        )
        iconEye.addEventListener("click", () => handleClickIconEye(iconEye))
        fireEvent.click(iconEye)

        expect(handleClickIconEye).toHaveBeenCalled()
        expect($.fn.modal).toHaveBeenCalled()
        expect(screen.getByRole("img").getAttribute("src")).toBe(billUrl)*/
      })
    })
  })

  



  
})
