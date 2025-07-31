/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { bills } from "../fixtures/bills.js"

import router from "../app/Router.js"
import mockStore from "../__mocks__/store.js"

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // DOM initialization
    const html = NewBillUI()
    document.body.innerHTML = html
  })
  
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill form should be rendered", () => {
      expect(screen.getByTestId("form-new-bill")).toBeInTheDocument()
    })
    
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
      window.onNavigate(ROUTES_PATH.NewBill)
      new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      await waitFor(() => screen.getByTestId("icon-mail"))
      const windowIcon = screen.getByTestId("icon-mail")

      expect(windowIcon.classList.contains("active-icon")).toBe(true)
    })

    describe("When I upload an image", () => {
      test("Then the file in a supported format should be accepted", () => {
        // navigation simulation
        const onNavigate = jest.fn()
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        // create simulation file
        const file = new File(["content"], "image.jpg", { type: "image/jpg" })
        const input = screen.getByTestId("file")

        // spy handleChangeFile function
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        // upload simulation
        input.addEventListener("change", handleChangeFile)
        userEvent.upload(input, file)

        expect(handleChangeFile).toHaveBeenCalled()
        expect(input.files[0].name).toBe("image.jpg")
      })

      test("Then an invalid file should be rejected", () => {
        // navigation simulation
        const onNavigate = jest.fn()
        new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        // create simulation file
        const file = new File(["content"], "image.mp4", { type: "image/mp4" })
        const input = screen.getByTestId("file")

        // block alert()
        window.alert = jest.fn() 
        // upload simulation
        userEvent.upload(input, file)

        expect(input.value).toBe("")
      })
    })
    
    describe("When I submit form with empty fields", () => {
      test("Then it should not navigate away from the NewBill page", () => {
        // navigation simulation
        const onNavigate = jest.fn()
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

        // spy handleSubmit function
        const handleSubmit = jest.spyOn(newBill, "handleSubmit")
        // submit simulation
        const form = screen.getByTestId("form-new-bill")
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form)

        expect(handleSubmit).toHaveBeenCalled()
        expect(form).toBeInTheDocument()
      })
    })
  })
})

// integration test POST
describe("Given I am a user connected as an employee", () => {
  describe("When I add a new bill", () => {
    test("Then it creates a new bill", async () => {
      // DOM initialization
      const html = NewBillUI()
      document.body.innerHTML = html
      // localStorage simulation
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      // connected employee simulation
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))
      // navigation simulation
      const onNavigate = jest.fn()
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      const billData = bills[0]
      const form = screen.getByTestId("form-new-bill")

      // form fill simulation
      userEvent.selectOptions(screen.getByTestId("expense-type"), billData.type)
      fireEvent.change(screen.getByTestId("datepicker"), { target: { value: billData.date } })
      await userEvent.type(screen.getByTestId("expense-name"), billData.name)
      await userEvent.type(screen.getByTestId("amount"), billData.amount.toString())
      await userEvent.type(screen.getByTestId("vat"), billData.vat.toString())
      await userEvent.type(screen.getByTestId("pct"), billData.pct.toString())
      await userEvent.type(screen.getByTestId("commentary"), billData.commentary)

      expect(screen.getByTestId("expense-type").value).toBe(billData.type)
      expect(screen.getByTestId("datepicker").value).toBe(billData.date)
      expect(screen.getByTestId("expense-name").value).toBe(billData.name)
      expect(screen.getByTestId("amount").value).toBe(billData.amount.toString())
      expect(screen.getByTestId("vat").value).toBe(billData.vat.toString())
      expect(screen.getByTestId("pct").value).toBe(billData.pct.toString())
      expect(screen.getByTestId("commentary").value).toBe(billData.commentary)

      // upload simulation
      const file = new File(["content"], "image.jpg", { type: "image/jpg" })
      const input = screen.getByTestId("file")
      userEvent.upload(input, file)

      expect(input.files[0]).toStrictEqual(file)
      expect(input.files).toHaveLength(1)

      // spy handleSubmit function
      const handleSubmit = jest.fn(newBill.handleSubmit)
      // upload simulation
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()
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