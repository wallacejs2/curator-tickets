import React, { useState } from 'react';
import { Ticket, TicketType, Status, Priority, IssueTicket, FeatureRequestTicket } from '../types.ts';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';

interface TicketItemProps {
  ticket: Ticket;
  