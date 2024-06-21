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
    });

    describe("isOfficeOwner", ()=>{
        const office = {owner: "12345"};

        it("returns true if user is owner", ()=>{
            const user = {_id: "12345"};
            const result = controller.isOfficeOwner(office, user);
            assert.equal(result, true);
        });

        it("returns false if user is not owner", ()=>{
            const user = {_id: "54321"};
            const result = controller.isOfficeOwner(office, user);
            assert.equal(result, false);
        });
    });

    describe("createNewTable", ()=>{
        const office = {tables: []};

        it("returns office with one new table", ()=>{
            const updatedOffice = controller.createNewTable({...office});
            assert.equal(updatedOffice.tables.length, 1);
        });

        it("creates table that contains a type", ()=>{
            const updatedOffice = controller.createNewTable({...office});
            assert.equal(typeof(updatedOffice.tables[0].type), "string")
            assert.notEqual(updatedOffice.tables[0].type, "");
        });

        it("creates table that contains 6 occupants", ()=>{
            const updatedOffice = controller.createNewTable({...office});
            assert.equal(updatedOffice.tables[0].occupants.length, 6);
            assert.equal(typeof(updatedOffice.tables[0].occupants[5].seatNumber), "number");
            assert.notEqual(updatedOffice.tables[0].occupants[4].seatNumber, "");
        });
    });
});
