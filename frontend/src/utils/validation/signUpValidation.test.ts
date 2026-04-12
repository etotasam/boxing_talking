import { describe, expect, test } from 'vitest';
import { validateName, validateEmail, validatePassword } from './signUpValidation';

describe('validateName', () => {
  test('2文字以下はfalse', () => {
    expect(validateName('')).toBe(false);
    expect(validateName('ab')).toBe(false);
  });

  test('3文字以上30文字以下はtrue', () => {
    expect(validateName('abc')).toBe(true);
    expect(validateName('a'.repeat(30))).toBe(true);
  });

  test('31文字以上はfalse', () => {
    expect(validateName('a'.repeat(31))).toBe(false);
  });
});

describe('validateEmail', () => {
  test('有効なメールアドレスはtrue', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.jp')).toBe(true);
    expect(validateEmail('user123@test.org')).toBe(true);
  });

  test('空文字はfalse', () => {
    expect(validateEmail('')).toBe(false);
  });

  test('@がないメールアドレスはfalse', () => {
    expect(validateEmail('testexample.com')).toBe(false);
  });

  test('先頭が記号のメールアドレスはfalse', () => {
    expect(validateEmail('.test@example.com')).toBe(false);
    expect(validateEmail('_test@example.com')).toBe(false);
  });

  test('ドメインにドットがないメールアドレスはfalse', () => {
    expect(validateEmail('test@example')).toBe(false);
  });
});

describe('validatePassword', () => {
  test('すべての条件を満たすパスワード', () => {
    const result = validatePassword('Password1');
    expect(result.hasUppercase).toBe(true);
    expect(result.isValidLength).toBe(true);
    expect(result.hasNumber).toBe(true);
    expect(result.isValid).toBe(true);
  });

  test('大文字を含まないパスワード', () => {
    const result = validatePassword('password1');
    expect(result.hasUppercase).toBe(false);
    expect(result.isValid).toBe(false);
  });

  test('数字を含まないパスワード', () => {
    const result = validatePassword('Password');
    expect(result.hasNumber).toBe(false);
    expect(result.isValid).toBe(false);
  });

  test('7文字以下のパスワード', () => {
    const result = validatePassword('Pass1');
    expect(result.isValidLength).toBe(false);
    expect(result.isValid).toBe(false);
  });

  test('25文字以上のパスワード', () => {
    const result = validatePassword('A'.repeat(24) + '1');
    expect(result.isValidLength).toBe(false);
    expect(result.isValid).toBe(false);
  });

  test('ちょうど8文字の有効なパスワード', () => {
    const result = validatePassword('Abcdef1x');
    expect(result.isValidLength).toBe(true);
    expect(result.isValid).toBe(true);
  });

  test('ちょうど24文字の有効なパスワード', () => {
    const result = validatePassword('A' + 'b'.repeat(22) + '1');
    expect(result.isValidLength).toBe(true);
    expect(result.isValid).toBe(true);
  });
});
