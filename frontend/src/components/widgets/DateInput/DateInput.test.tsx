/**
 * @license
 * Copyright 2018-2021 Streamlit Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react"
import { mount } from "src/lib/test_util"
import { WidgetStateManager } from "src/lib/WidgetStateManager"
import { DateInput as DateInputProto } from "src/autogen/proto"

import { Datepicker as UIDatePicker } from "baseui/datepicker"
import { lightTheme } from "src/theme"
import DateInput, { Props } from "./DateInput"

const getProps = (elementProps: Partial<DateInputProto> = {}): Props => ({
  element: DateInputProto.create({
    id: "1",
    label: "Label",
    default: ["1970/01/01"],
    min: "1970/1/1",
    ...elementProps,
  }),
  width: 0,
  disabled: false,
  theme: lightTheme.emotion,
  widgetMgr: new WidgetStateManager({
    sendRerunBackMsg: jest.fn(),
    pendingFormsChanged: jest.fn(),
  }),
})

describe("DateInput widget", () => {
  it("renders without crashing", () => {
    const props = getProps()
    const wrapper = mount(<DateInput {...props} />)
    expect(wrapper.find(UIDatePicker).length).toBe(1)
  })

  it("renders a label", () => {
    const props = getProps()
    const wrapper = mount(<DateInput {...props} />)
    expect(wrapper.find("StyledWidgetLabel").text()).toBe(props.element.label)
  })

  it("sets widget value on mount", () => {
    const props = getProps()
    jest.spyOn(props.widgetMgr, "setStringArrayValue")

    mount(<DateInput {...props} />)
    expect(props.widgetMgr.setStringArrayValue).toHaveBeenCalledWith(
      props.element,
      props.element.default,
      {
        fromUi: false,
      }
    )
  })

  it("has correct className and style", () => {
    const props = getProps()
    const wrapper = mount(<DateInput {...props} />)

    const wrappedDiv = wrapper.find("div").first()

    const { className, style } = wrappedDiv.props()
    // @ts-ignore
    const splittedClassName = className.split(" ")

    expect(splittedClassName).toContain("stDateInput")

    // @ts-ignore
    expect(style.width).toBe(getProps().width)
  })

  it("renders a default value", () => {
    const props = getProps()
    const wrapper = mount(<DateInput {...props} />)

    expect(wrapper.find(UIDatePicker).prop("value")).toStrictEqual([
      new Date(props.element.default[0]),
    ])
  })

  it("can be disabled", () => {
    const props = getProps()
    const wrapper = mount(<DateInput {...props} />)
    expect(wrapper.find(UIDatePicker).prop("disabled")).toBe(props.disabled)
  })

  it("has the correct format", () => {
    const props = getProps()
    const wrapper = mount(<DateInput {...props} />)
    expect(wrapper.find(UIDatePicker).prop("formatString")).toBe("yyyy/MM/dd")
  })

  it("updates the widget value when it's changed", () => {
    const props = getProps()
    jest.spyOn(props.widgetMgr, "setStringArrayValue")

    const wrapper = mount(<DateInput {...props} />)
    const newDate = new Date("2020/02/06")

    // @ts-ignore
    wrapper.find(UIDatePicker).prop("onChange")({
      date: newDate,
    })
    wrapper.update()

    expect(wrapper.find(UIDatePicker).prop("value")).toStrictEqual([newDate])
    expect(props.widgetMgr.setStringArrayValue).toHaveBeenCalledWith(
      props.element,
      ["2020/02/06"],
      {
        fromUi: true,
      }
    )
  })

  it("has a minDate", () => {
    const props = getProps()
    const wrapper = mount(<DateInput {...props} />)
    expect(wrapper.find(UIDatePicker).prop("minDate")).toStrictEqual(
      new Date("1970/1/1")
    )
    expect(wrapper.find(UIDatePicker).prop("maxDate")).toBeUndefined()
  })

  it("has a maxDate if it is passed", () => {
    const props = getProps({ max: "2030/02/06" })
    const wrapper = mount(<DateInput {...props} />)

    expect(wrapper.find(UIDatePicker).prop("maxDate")).toStrictEqual(
      new Date("2030/02/06")
    )
  })

  it("handles min dates with years less than 100", () => {
    const props = getProps({ min: "0001/01/01" })
    const wrapper = mount(<DateInput {...props} />)

    expect(wrapper.find(UIDatePicker).prop("minDate")).toStrictEqual(
      new Date("0001-01-01T00:00:00")
    )
  })

  it("handles max dates with years less than 100", () => {
    const props = getProps({ max: "0001/01/01" })
    const wrapper = mount(<DateInput {...props} />)

    expect(wrapper.find(UIDatePicker).prop("maxDate")).toStrictEqual(
      new Date("0001-01-01T00:00:00")
    )
  })
})
