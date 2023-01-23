import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../src/pairtest/TicketService";

// Test account id is positive.
describe("Test purchaseTickets only accepts valid account ids", () => {
    test("throw an error if not given", () => {
        const purchaseTickets = () => {
            new TicketService().purchaseTickets();
        };
        expect(purchaseTickets).toThrow(InvalidPurchaseException);
    });
    test.each([undefined, true, null, "test", [], {}, 0, -4])(
        "throw an error if not positive",
        (value) => {
            const purchaseTickets = () => {
                new TicketService().purchaseTickets(
                    value,
                    new TicketTypeRequest("ADULT", 1)
                );
            };
            expect(purchaseTickets).toThrow(InvalidPurchaseException);
        }
    );
    test.each([6, 3, 191])(
        "shoudn't throw if positive",
        (value) => {
            const purchaseTickets = () => {
                new TicketService().purchaseTickets(
                    value,
                    new TicketTypeRequest("ADULT", 1)
                );
            };
            expect(purchaseTickets).not.toThrow(InvalidPurchaseException);
        }
    );
});

// test type request only accepts valid types
describe("Test TicketTypeRequest only accepts valid types", () => {
    test.each([undefined, true, null, [], {}, 0, 1, "test", "CHLD", ""])(
        "throw invalid type",
        (value) => {
            const purchaseTickets = () => {
                new TicketTypeRequest(value, 1);
            };
            expect(purchaseTickets).toThrow(TypeError);
        }
    );
    test.each(["ADULT", "CHILD", "INFANT"])(
        "shouldn't throw valid type",
        (value) => {
            const purchaseTickets = () => {
                new TicketTypeRequest(value, 1);
            };
            expect(purchaseTickets).not.toThrow(TypeError);
        }
    );
});

// Test Only accepts valid quatity
describe("Test Only accepts valid quatity", () => {
    test.each([undefined, true, null, [], {}, 0, -14, "test", ""])(
        "throw an error if not positive",
        (value) => {
            const purchaseTickets = () => {
                new TicketTypeRequest("ADULT", value);
            };
            expect(purchaseTickets).toThrow(TypeError);
        }
    );
    test.each([8, 2, 19])("shouldn't throw an error ", (value) => {
        const purchaseTickets = () => {
            new TicketTypeRequest("ADULT", value);
        };
        expect(purchaseTickets).not.toThrow(TypeError);
    });
});


// Test not acccepts more than 20 tickets
describe("Test not acccepts more than 20 tickets.", () => {
    test.each([
        [1, 21, 0], [1, 0, 21],[21, 0, 0],
    ])(
        "throw an error if more than 20 tickets",
        (adultTickets, childTickets, infantsTickets) => {
            const purchaseTickets = () => {
                const ticketRequests = [];
                if (adultTickets > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("ADULT", adultTickets)
                    );
                if (infantsTickets > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("INFANT", infantsTickets)
                    );
                if (childTickets > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("CHILD", childTickets)
                    );
                new TicketService().purchaseTickets(1, ...ticketRequests);
            };
            expect(purchaseTickets).toThrow(InvalidPurchaseException);
        }
    );
    test.each([
        [1, 19, 0],[1, 0, 19],[20, 0, 0]
    ])(
        "shouldn't throw if 20 or less tickets",
        (adultTickets, childTickets, infantsTickets) => {
            const purchaseTickets = () => {
                const ticketRequests = [];
                if (adultTickets > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("ADULT", adultTickets)
                    );
                if (infantsTickets > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("INFANT", infantsTickets)
                    );
                if (childTickets > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("CHILD", childTickets)
                    );
                new TicketService().purchaseTickets(1, ...ticketRequests);
            };
            expect(purchaseTickets).not.toThrow(InvalidPurchaseException);
        }
    );
});

// Test for at least 1 adult ticket
describe("Test for at least one adult", () => {
    test.each([
        [0, 0, 1],
        [0, 1, 0],
    ])(
        "throw an error adult ticket is 0",
        (adultTickets, childTickets, infantsTickets) => {
            const purchaseTickets = () => {
                const ticketRequests = [];
                if (adultTickets > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("ADULT", adultTickets)
                    );
                if (childTickets > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("CHILD", childTickets)
                    );
                if (infantsTickets > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("INFANT", infantsTickets)
                    );
                new TicketService().purchaseTickets(1, ...ticketRequests);
            };
            expect(purchaseTickets).toThrow(InvalidPurchaseException);
        }
    );
    test.each([
        [1, 0, 1],
        [1, 1, 0],
    ])("shouldn't throw if adult tickets ordered", (adultTickets, childTickets, infantsTickets) => {
        const purchaseTickets = () => {
            const ticketRequests = [];
            if (adultTickets > 0)
                ticketRequests.push(new TicketTypeRequest("ADULT", adultTickets));
            if (childTickets > 0)
                ticketRequests.push(new TicketTypeRequest("CHILD", childTickets));
            if (infantsTickets > 0)
                ticketRequests.push(new TicketTypeRequest("INFANT", infantsTickets));
            new TicketService().purchaseTickets(1, ...ticketRequests);
        };
        expect(purchaseTickets).not.toThrow(InvalidPurchaseException);
    });
});

// Test return values
describe("Test purchaseTickets return values", () => {
    test.each([
        [1, 0, 0, 1],
        [1, 1, 0, 2],
        [1, 1, 1, 2],
        [3, 4, 2, 7],
        [4, 5, 0, 9],
        [4, 0, 3, 4],
    ])(
        "return number of seats for ticket order",
        (adultTickets, childTickets, infantsTickets, expectedSeats) => {
            const ticketRequests = [new TicketTypeRequest("ADULT", adultTickets)];
            if (childTickets > 0)
                ticketRequests.push(new TicketTypeRequest("CHILD", childTickets));
            if (infantsTickets > 0)
                ticketRequests.push(new TicketTypeRequest("INFANT", infantsTickets));
            const { noOfSeats } = new TicketService().purchaseTickets(
                1,
                ...ticketRequests
            );

            expect(noOfSeats).toBe(expectedSeats);
        }
    );
    test.each([
        [1, 0, 0, 20],
        [1, 1, 0, 30],
        [1, 1, 1, 30],
        [3, 4, 2, 100],
        [4, 5, 0, 130],
        [4, 0, 3, 80],
        [6, 10, 3, 220],
    ])(
        "return correct total cost for ordered tickets",
        (adultTickets, childTickets, infantsTickets, expectedCost) => {
            const ticketRequests = [new TicketTypeRequest("ADULT", adultTickets)];
            if (childTickets > 0)
                ticketRequests.push(new TicketTypeRequest("CHILD", childTickets));
            if (infantsTickets > 0)
                ticketRequests.push(new TicketTypeRequest("INFANT", infantsTickets));
            const { totalCost } = new TicketService().purchaseTickets(
                1,
                ...ticketRequests
            );

            expect(totalCost).toBe(expectedCost);
        }
    );
});
