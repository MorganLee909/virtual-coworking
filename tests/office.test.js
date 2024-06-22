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

    describe("splitMembersByVerification", ()=>{
        const office = {
            users: [
                {userId: 1},
                {userId: 2},
                {status: "unverified"},
                {userId: 3},
                {status: "unverified"}
            ]
        };

        it("returns correct number of verified users", ()=>{
            const members = controller.splitMembersByVerification(office);
            assert.equal(members.verified.length, 3);
        });

        it("returns correct number of unverified users", ()=>{
            const members = controller.splitMembersByVerification(office);
            assert.equal(members.unverified.length, 2);
        });
    });

    describe("createOffice", ()=>{
        const name = "Place";
        const userId = "1234";
        const location = "Some location";

        it("returns an object", ()=>{
            const office = controller.createOffice(name, userId, location);
            assert.equal(typeof(office), "object");
        });

        it("has one table with 6 seats", ()=>{
            const office = controller.createOffice(name, userId, location);
            assert.equal(office.tables.length, 1);
            assert.equal(office.tables[0].occupants.length, 6);
        });

        it("contains one user", ()=>{
            const office = controller.createOffice(name, userId, location);
            assert.equal(office.users.length, 1);
        });

        it("has a name", ()=>{
            const office = controller.createOffice(name, userId, location);
            assert.ok(office.name);
            assert.ok(office.identifier);
        });
    });

    describe("createMember", ()=>{
        it("creates user with userId if user not null", ()=>{
            const office = {users: []};
            const updatedOffice = controller.createMember({...office}, {_id: "12345"}, "john@mail.com");
            assert.equal(updatedOffice.users[0].status, "awaiting");
            assert.ok(updatedOffice.users[0].userId);
        });


        it("creates user with email if user is null", ()=>{
            const office = {users: []};
            const updatedOffice = controller.createMember({...office}, null, "john@mail.com");
            assert.equal(updatedOffice.users[0].status, "awaiting");
            assert.ok(updatedOffice.users[0].email);
        });
    });

    describe("activateUser", ()=>{
        const office = {users: [
            {userId: "1", status: "active"},
            {userId: "2", status: "awaiting"},
            {userId: "3", status: "active"}
        ]};

        it("changes the specific member to active", ()=>{
            const updatedOffice = controller.activateUser(office, "2");
            assert.equal(office.users[1].status, "active");
        });
    });

    describe("countActiveUsers", ()=>{
        let office = {users: [
            {userId: "1", status: "active"},
            {userId: "2", status: "awaiting"},
            {userId: "3", status: "activ"},
            {userId: "4", status: "awaiting"},
            {userId: "5", status: "active"}
        ]};

        it("returns accurate count of active users", ()=>{
            const count = controller.countActiveUsers(office);
            assert.equal(count, 2);
        });
    });
});
