const {describe, it} = require("node:test");
const assert = require("node:assert").strict;
const controller = require("../controllers2/office.js");

describe("office.js", ()=>{
    describe("userIsAuthorized", ()=>{
        const members = [
            {
                userId: "1",
                status: "active"
            },
            {
                userId: "2",
                status: "active"
            },
            {
                userId: "3",
                status: "awaiting"
            }
        ];

        it("returns true if userId is in list of members", ()=>{
            const result = controller.userIsAuthorized(members, "1");
            assert.equal(result, true);
        });
        
        it("returns false if userId is not in list of members", ()=>{
            const result = controller.userIsAuthorized(members, "5");
            assert.equal(result, false);
        });

        it("returns false if found member is not active", ()=>{
            const result = controller.userIsAuthorized(members, "3");
            assert.equal(result, false);
        });
    })
})
