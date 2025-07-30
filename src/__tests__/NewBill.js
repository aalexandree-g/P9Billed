/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

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

      // check if class "active-icon" is correctly affected
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
