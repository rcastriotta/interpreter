import { parseExpression, parseProgram, Statement } from "../include/parser.js";
import { State, interpExpression, interpProgram, interpStatement } from "./interpreter.js";

function expectStateToBe(program: string, state: State) {
  expect(interpProgram(parseProgram(program))).toEqual(state);
}

describe("interpExpression", () => {
  it("evaluates multiplication with a variable", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x * 2"));
    expect(r).toEqual(20);

    expect(() => {
      const r = interpExpression({ x: 10 }, parseExpression("x * y"));
      expect(r).toEqual(20);
    }).toThrow("Multiplication can only happen between numbers");
  });

  it("evaluates addition with a variable", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x + 2"));
    expect(r).toEqual(12);

    expect(() => {
      const r = interpExpression({ x: 10 }, parseExpression("x + y"));
      expect(r).toEqual(20);
    }).toThrow("Addition can only happen between numbers");
  });

  it("evaluates subtraction with a variable", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x - 2"));
    expect(r).toEqual(8);

    expect(() => {
      const r = interpExpression({ x: 10 }, parseExpression("x - y"));
      expect(r).toEqual(20);
    }).toThrow("Subtraction can only happen between numbers");
  });

  it("evaluates division with a variable", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x / 2"));
    expect(r).toEqual(5);

    expect(() => {
      const r = interpExpression({ x: 10 }, parseExpression("x / y"));
      expect(r).toEqual(20);
    }).toThrow("Division can only happen between numbers");

    expect(() => {
      const r = interpExpression({ x: 10 }, parseExpression("x / 0"));
      expect(r).toEqual(20);
    }).toThrow("Division by zero is forbidden");
  });

  it("evaluates boolean logic", () => {
    const r = interpExpression({ x: 10 }, parseExpression("true && true"));
    expect(r).toEqual(true);

    const r2 = interpExpression({ x: 10 }, parseExpression("true || false"));
    expect(r2).toEqual(true);

    expect(() => {
      const r = interpExpression({ x: 10 }, parseExpression("true && 0"));
      expect(r).toEqual(20);
    }).toThrow("Logical AND can only happen between booleans");

    expect(() => {
      const r = interpExpression({ x: 10 }, parseExpression("true || 0"));
      expect(r).toEqual(20);
    }).toThrow("Logical OR can only happen between booleans");
  });

  it("evaluates less/greater/equal operators", () => {
    const r = interpExpression({ x: 10 }, parseExpression("true === true"));
    expect(r).toEqual(true);

    const r2 = interpExpression({ x: 10 }, parseExpression("5 < 10"));
    expect(r2).toEqual(true);

    const r3 = interpExpression({ x: 10 }, parseExpression("12 > 10"));
    expect(r3).toEqual(true);

    expect(() => {
      interpExpression({ x: 10 }, parseExpression("true > 0"));
    }).toThrow("Greater than comparison can only happen between numbers");

    expect(() => {
      interpExpression({ x: 10 }, parseExpression("true < 0"));
    }).toThrow("Less than comparison can only happen between numbers");
  });
});

describe("interpStatement", () => {
  // Tests for interpStatement go here.

  it("check handles assignment", () => {
    const parsed: Statement[] = parseProgram(`
    x = x + 2;
    `);

    const s = { x: 10 };
    interpStatement(s, parsed[0]);

    expect(s.x).toEqual(12);
  });

  it("check throws assignment error", () => {
    const parsed: Statement[] = parseProgram(`
    x = x + 2;
    `);

    const s = {};

    expect(() => {
      interpStatement(s, parsed[0]);
    }).toThrow("Addition can only happen between numbers");
  });

  it("evaluates if statement with a variable", () => {
    const parsed: Statement[] = parseProgram(`
    if (x < 11) {
      x = x + 5;
    } else {
      x = x - 5;
    }`);

    const s = { x: 10 };
    interpStatement(s, parsed[0]);
    expect(s.x).toEqual(15);
  });

  it("check already declared", () => {
    const parsed: Statement[] = parseProgram(`
    let x = 10;
    `);

    const s = { x: 10 };
    expect(() => {
      interpStatement(s, parsed[0]);
    }).toThrow("Variable x already declared");
  });
});

describe("interpProgram", () => {
  it("handles declarations and reassignment and while loop", () => {
    // TIP: Use the grave accent to define multiline strings
    expectStateToBe(
      ` 
      let x = 10;
      x = 20;
      x = x * 2;
      while (x < 45) {
        x = x + 1;
      }
    `,
      { x: 45 }
    );
  });

  it("check not declared error thrown", () => {
    const program = `
      let x = 5;
      if (x < 10) {
        let y = 3;
        y = y + 7;
      } else {
        x = x + 4;
      }
      y = y + 2;
    `;
    expect(() => {
      interpProgram(parseProgram(program));
    }).toThrow("Addition can only happen between numbers");
  });

  it("check nested while loops", () => {
    const program = `
     let x = 5;
     let y = 12;
     if (x < 10) {
      while (x < 10) {
        x = x + 1;
        while (y < 20) {
          y = y + 1;
        }
      }
     } else {
      x = x - 5;
     }
    `;
    expectStateToBe(program, { x: 10, y: 20 });
  });
});
