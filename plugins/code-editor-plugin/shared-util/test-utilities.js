/* eslint-disable */
import React from 'react';
import userEvent from '@testing-library/user-event';
import {fireEvent, render, screen, within, act, renderHook} from '@testing-library/react';
import {CodeEditorContext} from "../client/CodeEditorContext";

class TestUtilities {
  static getUser() {
    return userEvent.setup({ delay: null });
  }

  static async click(element) {
    const user = this.getUser();

    await user.click(element);
    await this.allowComponentUpdates();
  }

  static async clickByText(name) {
    const element = await screen.getByText(name);
    await this.click(element);
    await this.allowComponentUpdates();
  }

  static async clickByTitle(title) {
    const element = TestUtilities.getByTitle(title);
    await this.click(element);
    await this.allowComponentUpdates();
  }

  static getByTitle(title) {
    return screen.getByTitle(title);
  }


  static updateField(element, value) {
    fireEvent.change(element, {
      target: { value: value },
    });
  }

  static async allowComponentUpdates(ms) {
    await act(async () => jest.advanceTimersByTime(ms ? ms : 1050));
  }

  static async render(element) {
    const wrapper = render(element);
    await this.allowComponentUpdates();
    return wrapper;
  }

  static getByText(text) {
    return screen.getByText(text);
  }

  static getAllByLabel(label) {
    return screen.getAllByLabelText(label);
  }
  static getByLabel(label) {
    return screen.getByLabelText(label);
  }
  static updateFieldByLabel(label, value) {
    const element = this.getByLabel(label);
    TestUtilities.updateField(element, value);
  }

  static getByRole(role, attrs) {
    return screen.getByRole(role, attrs);
  }

  static getAllByRole(role, attrs) {
    return screen.getAllByRole(role, attrs);
  }

  static getByTestId(testId) {
    return screen.getByTestId(testId);
  }

  static async chooseDropdownOption(label, option) {
    const dropdown = this.getByLabel(label);
    fireEvent.focus(dropdown);
    fireEvent.keyDown(dropdown, { key: 'ArrowDown', code: 40 });
    const dropdownOptions = await screen.findAllByText(option);
    fireEvent.click(dropdownOptions[0]);
    await TestUtilities.allowComponentUpdates();
    await screen.getByDisplayValue(option);
  }
  static queryByText(text) {
      return screen.queryByText(text);
  }

  static renderHook(render, options = {}){
      return renderHook(render, options)
  }

  static mouseEnter(element) {
      return fireEvent.mouseEnter(element);
  }

  static mouseLeave(element) {
      return fireEvent.mouseLeave(element);
  }

  static async actAsync(callback) {
      await act(async () => {
          await callback();
      });
      await this.allowComponentUpdates();
  }

  static actSync(callback) {
      act(() => {
          callback();
      });
  }
}


export default TestUtilities;
