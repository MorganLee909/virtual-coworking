const Office = require("../models/office.js");

/**
 * Determines whether the user is a member of the office
 *
 * @params {[Member]} members - Members of the office to check
 * @params {string} userId - String ID of the user to check
 * @return {boolean} - True is user is member, false otherwise
 */
const userIsAuthorized = (members, userId)=>{
    let isMember = false;
    for(let i = 0; i < members.length; i++){
        if(!members[i].userId) continue;
        if(members[i].userId.toString() === userId){
            if(members[i].status !== "active") return false;
            return true;
        }
    }

    return false;
}

/**
 * Determines if user is the owner of the office
 *
 * @params {Office} office - Office to check for ownership
 * @params {User} user - User to check for ownership
 * @return {boolean} - True if user is owner, false otherwise;
 */
const isOfficeOwner = (office, owner)=>{
    return office.owner.toString() === owner._id.toString();
}

/**
 * Creates a new table for an office
 *
 * @params {Office} office - Office in which to add a table
 * @return {Office} - Updated office
 */
const createNewTable = (office)=>{
    const newTable = {
        type: "general",
        occupants: []
    };

    for(let i = 0; i < 6; i++){
        newTable.occupants.push({seatNumber: 1});
    }

    office.tables.push(newTable);
    return office;
}

/**
 * Split members into verified/unverified. Allows fetching verified users
 *
 * @param {Office} office - Office containing the members
 * @return {{verified: [Member], unverified: [Member]}} - Members organized by verification
 */
const splitMembersByVerification = (office)=>{
    const members = {
        verified: [],
        unverified: []
    };

    for(let i = 0; i < office.users.length; i++){
        if(office.users[i].userId){
            members.verified.push(office.users[i].userId);
        }else{
            members.unverified.push(office.users[i]);
        }
    }

    return members;
}

/**
 * Create a new office
 * 
 * @param {string} name - Name of the office
 * @param {ObjectId} userId - ID for owner of the office
 * @param {string} location - String ID for location of the office
 * @return {Office} - Newly created office object
 */
const createOffice = (name, userId, location)=>{
    const office = new Office({
        name: name,
        identifier: name.replaceAll(" ", "-"),
        tables: [{
            type: "general",
            occupants: []
        }],
        owner: userId,
        users: [{
            status: "active",
            userId: userId
        }],
        location: location
    });

    for(let i = 0; i < 6; i++){
        office.tables[0].occupants.push({seatNumber: i});
    }

    return office;
}

/**
 * Create an office member from an already signed-up user
 *
 * @param {Office} office - Office to add member to
 * @param {User} user - User to add to office
 * @param {string} email - Email address of new user
 * @return {Office} - Updated office
 */
const createMember = (office, user, email)=>{
    office.users.push({
        status: "awaiting",
        userId: user ? user._id : null,
        email: email.toLowerCase()
    });

    return office;
}

/**
 * Update the user in the office to be an active user
 *
 * @param {Office} office- Office containing the user to be activated
 * @param {string} userId - String ID for user to be activated
 * @return {Office} - Updated office
 */
const activateUser = (office, userId)=>{
    for(let i = 0; i < office.users.length; i++){
        if(office.users[i].userId.toString() === userId){
            office.users[i].userId = userId;
            office.users[i].status = "active";
            break;
        }
    }
    return office;
}

/**
 * Counts the number of active users for an office
 *
 * @param {Office} office - Office to count users
 * @return {number} - Count of active users
 */
const countActiveUsers = (office)=>{
    let count = 0;
    for(let i = 0; i < office.users.length; i++){
        if(office.users[i].status === "active") count++;
    }

    return count;
}

/**
 * Uses a stripe subscription object to create items for update
 *
 * @param {Subscription} sub - Stripe subscription from which to get items
 * @param {number} activeUsers - Current number of active users
 * @return {object} - Object containing the proper data for updating a subscription
 */
const getSubscriptionItems = (sub, activeUsers)=>{
    const item = sub.items.data.find(i=>i.price.id === process.env.OFFICE_MEMBER_PRICE);

    const items = [{
        id: item.id,
        price: process.env.OFFICE_MEMBER_PRICE,
        quantity: activeUsers
    }];

    return {items};
}

/**
 * Remove a member from an office
 *
 * @param {Office} office - Office to remove member from
 * @param {string} member - Member ID
 * @return {{Office, email}} - Updated office
 */
const removeMember = (office, member)=>{
    let email = "";
    for(let i = 0; i < office.users.length; i++){
        if(office.users[i]._id.toString() === member){
            email = office.users[i].email;
            office.users.splice(i, 1);
            break;
        }
    }
    const stuff = {office, email};
    return stuff;
}

const handleError = (error)=>{
    const response = {
        error: true,
        message: ""
    };

    switch(error){
        case "unauthorizedUser":
            response.message = "This office is private";
            break;
        case "notOwner":
            response.message = "You do not own this office";
            break;
        case "badInvitation":
            response.message = "Invalid office invitation";
            break;
        default:
            console.error(error);
            response.message = "Server error";
    }

    return response;
}

module.exports = {
    userIsAuthorized,
    isOfficeOwner,
    createNewTable,
    splitMembersByVerification,
    createOffice,
    createMember,
    activateUser,
    countActiveUsers,
    getSubscriptionItems,
    removeMember,
    handleError
};
