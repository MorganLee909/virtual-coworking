const {describe, it} = require("node:test");
const assert = require("node:assert").strict;
const user = require("../controllers2/user.js");

describe("isValidEmail", ()=>{
    it("returns true on valid email address", ()=>{
        assert.equal(user.isValidEmail("lee.morgan@blacklist.aero"), true);
        assert.equal(user.isValidEmail("somebody@example.com"), true);
        assert.equal(user.isValidEmail("user@gmail.com"), true);
    });

    it("returns false if missing top-level domain", ()=>{
        assert.equal(user.isValidEmail("my.name@blacklist."), false);
    });

    it("returns false if missing domain", ()=>{
        assert.equal(user.isValidEmail("my.name"), false);
    });
});

describe("passwordsMatch", ()=>{
    it("returns true for matching strings", ()=>{
        assert.equal(user.passwordsMatch("password123", "password123"), true);
    });

    it("returns false for non-matching strings", ()=>{
        assert.equal(user.passwordsMatch("pasword123", "password123"), false);
    });
});

describe("passwordValidLength", ()=>{
    it("returns true if password length is 10", ()=>{
        assert.equal(user.passwordValidLength("1234567890"), true);
    });

    it("returns true if password length greater than 10", ()=>{
        assert.equal(user.passwordValidLength("12345678900"), true);
    });

    it("returns false if password length less than 10", ()=>{
        assert.equal(user.passwordValidLength("1234567"), false);
    });
});

describe("confirmationCode", ()=>{
    it("contains 6 characters", ()=>{
        const code = user.confirmationCode();
        assert.equal(code.length === 6, true);
    });

    it("is a valid number", ()=>{
        const code = user.confirmationCode();
        assert.equal(isNaN(Number(code)), false);
    });
});

describe("createOfficeUser", ()=>{
    const a = {
        email: "one@mail.com",
        password: "1234567890",
        firstName: "One",
        lastName: "Two"
    };
    const b = "id";
    const c = "stripeId";


    it("returns something", ()=>{
        assert.ok(user.createOfficeUser(a, b, c));
    });

    it("hashes the password", ()=>{
        let newUser = user.createOfficeUser(a, b, c);
        assert.notEqual(a.password, newUser.password);
    });

    it("creates session ID", ()=>{
        let newUser = user.createOfficeUser(a, b, c);
        assert.equal(typeof(newUser.session), "string");
    });
});

describe("activateOfficeUser", ()=>{
    const email = "bob@mail.com";
    const userId = "12345";
    const offices = [];
    for(let i = 0; i < 3; i++){
        offices.push({
            users: [{
                status: "inactive",
                email: "bob@mail.com"
            }]
        });
    }
    const updatedOffices = user.activateOfficeUser(email, userId, offices);


    it("returns an array with at least 1 element", ()=>{
        assert.equal(updatedOffices.length >= 1, true);
    });

    it("sets status of user in all offices to 'active'", ()=>{
        let allActive = true;
        for(let i = 0; i < updatedOffices.length; i++){
            if(updatedOffices[i].users[0].status !== "active"){
                allActive = false;
                break;
            }
        }
        assert.equal(allActive, true);
    });

    it("sets the userId and removes the email for the user", ()=>{

    });
});

describe("createUser", ()=>{
    const userData = {
        email: "bob@mail.com",
        password: "1234567890",
        firstName: "Bob",
        lastName: "Smith"
    };
    const locationId = "12345";
    const stripeCustomer = {id: "12345"};

    it("returns an object", ()=>{
        assert.equal(typeof(user.createUser(userData, locationId, stripeCustomer,user.confirmationCode())), "object");
    });

    it("creates a hashed password", ()=>{
        let newUser = user.createUser(userData, locationId, stripeCustomer, user.confirmationCode());
        assert.notEqual(newUser.password, userData.password);
    });

    it("creates a session id", ()=>{
        let newUser = user.createUser(userData, locationId, stripeCustomer, user.confirmationCode());
        assert.ok(newUser.session);
    });

    it("contains a stripe customer id number", ()=>{
        let newUser = user.createUser(userData, locationId, stripeCustomer, user.confirmationCode());
        assert.equal(typeof(newUser.stripe.customerId), "string");
    });

    it("creates valid email confirmation code", ()=>{
        let newUser = user.createUser(userData, locationId, stripeCustomer, user.confirmationCode());
        let statusData = newUser.status.split("-");

        assert.equal(statusData[0], "email");
        assert.equal(statusData[1].length === 6, true);
    });
});

describe("validEmailCode", ()=>{
    it("returns true if code matches", ()=>{
        const code = user.validEmailCode("123456", "email-123456");
        assert.equal(code, true);
    });

    it("returns false if code does not match", ()=>{
        const code = user.validEmailCode("123456", "email-654321");
        assert.equal(code, false);
    });
});
