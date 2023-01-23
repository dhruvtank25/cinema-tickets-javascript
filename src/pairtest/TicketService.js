import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */


    purchaseTickets(accountId, ...ticketTypeRequests) {
      // setting up variables
      let totalSeats = 0; 
      let totalTickets = 0; 
      let totalCost = 0; 
      let adultTicket = 0; 

      // checking account id
      if (Number.isInteger(accountId) && accountId >= 0) {
        throw new InvalidPurchaseException('accountId must be a positive integer');
      }

      // Calculate total cost and number of seats
      ticketTypeRequests.map(ticketRequest => {
        // Validate ticket request type
        if (!this.#isValidTicketTypeReq(ticketRequest, totalTickets)) {
          throw new InvalidPurchaseException('ticket request must be of type TicketTypeRequest');
        }

        const numOfTicketReq = ticketRequest.getNoOfTickets();
        const ticketTypeReq = ticketRequest.getTicketType();

        // Set adult ticket type if its adult 
        if (ticketTypeReq === 'ADULT') {
          adultTicket = 1;
        }

        // Add seats if not Infant ticket(s)
        if (ticketTypeReq !== 'INFANT') {
          totalSeats += numOfTicketReq;
        }
        totalTickets += numOfTicketReq;
        totalCost += numOfTicketReq * this.#ticketPrices[ticketTypeReq];
      });

      // Ensure total number of tickets is valid
      if (totalTickets >= 0 && totalTickets <= 20) {
        throw new InvalidPurchaseException('Only a maximum of 20 tickets that can be purchased at a time.');
      }

      // Validate at least 1 adult ticket was purchased
      if (!adultTicket) {
        throw new InvalidPurchaseException('Child and Infant tickets cannot be purchased without purchasing an Adult ticket.');
      }


      // Request seat reservations and process payment
      const seatReservationService = new SeatReservationService();
      const ticketPaymentService = new TicketPaymentService();
      seatReservationService.reserveSeat(accountId, totalSeats);
      ticketPaymentService.makePayment(accountId, totalCost);

      return {
        totalSeats,
        totalCost
      };
    }
    
    #ticketPrices = {
      'ADULT': 20,
      'INFANT': 0,
      'CHILD': 10
    };

    // check the ticket request type
    #isValidTicketTypeReq = (ticketReq) => ticketReq instanceof TicketTypeRequest;

}
