//const PARENT_STATE_KEY = "[[PARENT]]";
export function interpExpression(state, exp) {
    switch (exp.kind) {
        case "boolean":
            return exp.value;
        case "number":
            return exp.value;
        case "variable":
            const variableValue = state[exp.name];
            return variableValue;
        case "operator":
            const leftValue = interpExpression(state, exp.left);
            const rightValue = interpExpression(state, exp.right);
            switch (exp.operator) {
                case "+":
                    if (typeof leftValue === "number" && typeof rightValue === "number") {
                        return leftValue + rightValue;
                    }
                    throw new Error("Addition can only happen between numbers");
                case "-":
                    if (typeof leftValue === "number" && typeof rightValue === "number") {
                        return leftValue - rightValue;
                    }
                    throw new Error("Subtraction can only happen between numbers");
                case "*":
                    if (typeof leftValue === "number" && typeof rightValue === "number") {
                        return leftValue * rightValue;
                    }
                    throw new Error("Multiplication can only happen between numbers");
                case "/":
                    if (typeof leftValue === "number" && typeof rightValue === "number") {
                        if (rightValue === 0) {
                            throw new Error("Division by zero is forbidden");
                        }
                        return leftValue / rightValue;
                    }
                    throw new Error("Division can only happen between numbers");
                case "&&":
                    if (typeof leftValue === "boolean" && typeof rightValue === "boolean") {
                        return leftValue && rightValue;
                    }
                    throw new Error("Logical AND can only happen between booleans");
                case "||":
                    if (typeof leftValue === "boolean" && typeof rightValue === "boolean") {
                        return leftValue || rightValue;
                    }
                    throw new Error("Logical OR can only happen between booleans");
                case "<":
                    if (typeof leftValue === "number" && typeof rightValue === "number") {
                        return leftValue < rightValue;
                    }
                    throw new Error("Less than comparison can only happen between numbers");
                case ">":
                    if (typeof leftValue === "number" && typeof rightValue === "number") {
                        return leftValue > rightValue;
                    }
                    throw new Error("Greater than comparison can only happen between numbers");
                case "===":
                    return leftValue === rightValue;
                default:
                    throw new Error(`Unknown operator`);
            }
        default:
            throw new Error(`Unknown expression kind: ${exp.kind}`);
    }
}
export function interpStatement(state, stmt) {
    switch (stmt.kind) {
        case "let":
            const value = interpExpression(state, stmt.expression);
            if (typeof state[stmt.name] !== "undefined") {
                throw new Error(`Variable ${stmt.name} already declared`);
            }
            state[stmt.name] = value;
            break;
        case "assignment":
            const newValue = interpExpression(state, stmt.expression);
            if (typeof state[stmt.name] === "undefined") {
                throw new Error(`Variable ${stmt.name} not found`);
            }
            state[stmt.name] = newValue;
            break;
        case "if":
            const testValue = interpExpression(state, stmt.test);
            if (typeof testValue !== "boolean") {
                throw new Error("Conditional expression must be a boolean");
            }
            const before = { ...state };
            if (testValue) {
                for (const statement of stmt.truePart) {
                    interpStatement(state, statement);
                }
            }
            else {
                for (const statement of stmt.falsePart) {
                    interpStatement(state, statement);
                }
            }
            // remove scoped values
            for (const key of Object.keys(state)) {
                if (typeof before[key] == "undefined") {
                    delete state[key];
                }
            }
            break;
        case "while":
            let conditionValue = interpExpression(state, stmt.test);
            if (typeof conditionValue !== "boolean") {
                throw new Error("Conditional expression must be a boolean");
            }
            while (conditionValue) {
                const before = { ...state };
                for (const statement of stmt.body) {
                    interpStatement(state, statement);
                }
                // remove scoped values
                for (const key of Object.keys(state)) {
                    if (typeof before[key] == "undefined") {
                        delete state[key];
                    }
                }
                conditionValue = interpExpression(state, stmt.test);
                if (typeof conditionValue !== "boolean") {
                    throw new Error("Conditional expression must be a boolean");
                }
            }
            break;
        case "print":
            const printedValue = interpExpression(state, stmt.expression);
            console.log(printedValue);
            break;
        default:
            throw new Error(`Unknown statement kind: ${stmt.kind}`);
    }
}
export function interpProgram(program) {
    const block = {};
    for (const statement of program) {
        interpStatement(block, statement);
    }
    return block;
}
//# sourceMappingURL=interpreter.js.map