/**
 * Safely evaluates a mathematical expression string.
 * Supports +, -, *, /, ., and ()
 * Avoids using eval() or new Function().
 * Returns null if the expression is invalid, incomplete, or contains division by zero.
 */
export function safeEvaluate(expression: string): number | null {
  if (!expression) return null;

  // Remove spaces and commas
  const expr = expression.replace(/[\s,]/g, "");
  if (!expr) return null;

  // Tokenize the string
  const tokens: string[] = [];
  let numStr = "";

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if (/[0-9.]/.test(char)) {
      numStr += char;
    } else if (/[+\-*/()]/.test(char)) {
      if (numStr) {
        if (numStr === "-") {
          return null; // Invalid standalone minus
        }
        // Validate multiple decimals
        if ((numStr.match(/\./g) || []).length > 1) {
          return null;
        }
        tokens.push(numStr);
        numStr = "";
      }

      if (char === "-") {
        const prev = tokens.length > 0 ? tokens[tokens.length - 1] : null;
        if (!prev || ["+", "-", "*", "/", "("].includes(prev)) {
          // Unary minus detected
          if (expr[i + 1] === "(") {
            tokens.push("-1", "*");
            continue;
          } else {
            numStr = "-";
            continue;
          }
        }
      }

      tokens.push(char);
    } else {
      // Invalid character found
      return null;
    }
  }

  if (numStr) {
    if (numStr === "-") return null;
    if ((numStr.match(/\./g) || []).length > 1) return null;
    tokens.push(numStr);
  }

  if (tokens.length === 0) return null;

  // Validate parentheses balance
  let parenCount = 0;
  for (const token of tokens) {
    if (token === "(") parenCount++;
    if (token === ")") parenCount--;
    if (parenCount < 0) return null;
  }
  if (parenCount !== 0) return null;

  // Basic check for incomplete expression (ends with operator)
  const lastToken = tokens[tokens.length - 1];
  if (["+", "-", "*", "/"].includes(lastToken)) return null;

  // Shunting-yard algorithm to parse infix to postfix
  const precedence: Record<string, number> = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
  };

  const outputQueue: string[] = [];
  const operatorStack: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (!isNaN(Number(token))) {
      outputQueue.push(token);
    } else if (token === "(") {
      operatorStack.push(token);
    } else if (token === ")") {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== "("
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.pop(); // Pop the "("
    } else {
      // Operator
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== "(" &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    }
  }

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop()!);
  }

  // Evaluate Postfix Expression
  const evalStack: number[] = [];

  for (const token of outputQueue) {
    if (!isNaN(Number(token))) {
      evalStack.push(Number(token));
    } else {
      const b = evalStack.pop();
      const a = evalStack.pop();

      if (a === undefined || b === undefined) return null;

      let result = 0;
      switch (token) {
        case "+":
          result = a + b;
          break;
        case "-":
          result = a - b;
          break;
        case "*":
          result = a * b;
          break;
        case "/":
          if (b === 0) return null; // Division by zero
          result = a / b;
          break;
        default:
          return null;
      }
      evalStack.push(result);
    }
  }

  if (evalStack.length !== 1) return null;

  const finalResult = evalStack[0];
  if (isNaN(finalResult) || !isFinite(finalResult)) return null;

  // Round to 2 decimal places to handle float precision
  return Math.round(finalResult * 100) / 100;
}
