/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

import router from "../app/Router.js"
import mockStore from "../__mocks__/store.js"

describe("Given I am connected as an employee", () => {
  let billsContainer

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // localStorage simulation
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      // connected employee simulation
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))
      // DOM initialization
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.innerHTML = ""
      document.body.append(root)
      router()
      // environment simulation
      window.onNavigate(ROUTES_PATH.Bills)
      billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      await waitFor(() => screen.getByTestId("icon-window"))
      const windowIcon = screen.getByTestId("icon-window")

      // check if class "active-icon" is correctly affected
      expect(windowIcon.classList.contains("active-icon")).toBe(true)
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
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        // connected employee simulation
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))
        // DOM initialization
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        // environment simulation
        window.onNavigate(ROUTES_PATH.Bills)
        billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

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

    describe("When I click on the eye icon to preview a bill", () => {
      test("Then it should open a modal", () => {
        // localStorage simulation
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        // connected employee simulation
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))
        // DOM initialization
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        // environment simulation
        window.onNavigate(ROUTES_PATH.Bills)
        billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

        // modal simulation
        $.fn.modal = jest.fn()
        
        document.body.innerHTML = BillsUI({ data: bills })

        // get the first eye icon
        const modal = document.getElementById("modaleFile")
        const iconEye = screen.getAllByTestId("icon-eye")[0]

        // spy handleClickIconEye function
        const handleClickIconEye = jest.fn(() => billsContainer.handleClickIconEye(iconEye))
        // attach function to click
        iconEye.addEventListener("click", handleClickIconEye)
        // click simulation
        fireEvent.click(iconEye)

        expect(handleClickIconEye).toHaveBeenCalled()
        expect(modal).toBeTruthy()
      })
    })

    describe("and it is loading", () => {
      test("Then loading page should be rendered", () => {
        document.body.innerHTML = BillsUI({ loading: true })
        expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument()
      })
    })

    describe("and it throws an error", () => {
      test("Then error page should be rendered", () => {
        document.body.innerHTML = BillsUI({ error: "An error occurs" })
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })
})

// integration test GET
describe("Given I am a user connected as an admin", () => {
  describe("When I navigate to Dashboard", () => {
    let billsContainer

    test("Then it should fetch the list of bills from the mock API", () => {
      // localStorage simulation
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      // connected admin simulation
      localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }))
      // DOM initialization
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      // environment simulation
      window.onNavigate(ROUTES_PATH.Dashboard)
      billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      billsContainer.getBills().then(data => {
        root.innerHTML = BillsUI({ data })
        expect(document.querySelector("tbody").rows.length).toBeGreaterThan(0)
      })
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      // localStorage simulation
      Object.defineProperty( window, "localStorage", { value: localStorageMock })
      // connected admin simulation
      window.localStorage.setItem('user', JSON.stringify({ type: "Admin", email: "a@a" }))
      // DOM initialization
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
      // environment simulation
      window.onNavigate(ROUTES_PATH.Dashboard)
    })

    test("Then it should fail with 404 message error", () => {
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("Then it should fail with 500 message error", () => {
      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})