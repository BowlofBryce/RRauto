# Universal Service Business CRM Template System

Reusable backend CRM template for service businesses (landscaping, pressure washing, window cleaning, home services, appointment-driven businesses).

## Stack
- Node.js + TypeScript
- PostgreSQL
- REST API
- Modular architecture by domain

## Project Structure

```text
src/
  modules/
    contacts/
    leads/
    jobs/
    quotes/
    automations/
    communications/
    pipeline/
  services/
    sms/
    email/
  core/
    pipeline/
    automation_engine/
  database/
    schema/
```

## PostgreSQL Schema
The full schema is in `src/database/schema/schema.sql` and includes tenant-isolated entities keyed by `business_id` with FK constraints and indexes.

## API Routes (all scoped by `x-business-id`)

- `GET/POST /contacts`
- `GET/POST /leads`
- `GET/POST /jobs`
- `GET/POST /quotes`
- `GET/POST /communications`
- `GET/POST /automations`
- `POST /automations/install-defaults`
- `POST /automations/queue/process`
- `POST /automations/events/missed-call`
- `GET/PUT /pipeline`

## Pipeline System
Pipeline stages are configurable per business using `pipeline_stages` and the `/pipeline` endpoint. Businesses can rename/reorder stages by replacing the stage list.

## Automation Engine
- Trigger ingestion via `enqueueAutomationTrigger`
- Queue-backed delayed steps via `automation_queue`
- Action execution for:
  - `send_sms`
  - `send_email`
  - `create_task`
  - `update_pipeline_stage`
- Observability via `automation_logs`

## Default Automation Templates
Installed by `POST /automations/install-defaults`:
1. Lead response automation
2. Quote follow-up (+24h)
3. Appointment reminder
4. Review request after completed jobs
5. Customer reactivation (inactive contact campaigns)
6. Missed call text back

## SMS + Email Provider Abstractions
- `sendSMS()` and `sendEmail()` are provider-agnostic facades.
- Twilio and SendGrid adapters are example implementations.
- Override providers at boot via `configureSMSProvider()` and `configureEmailProvider()`.

## Missed Call Text Back
Use `POST /automations/events/missed-call` with `contact_id`. This queues the automation that sends:

> "Sorry we missed your call. How can we help?"

## How to Clone for New Client Deployments
1. Provision a new PostgreSQL database (or schema) for the client.
2. Run `src/database/schema/schema.sql`.
3. Create one row in `businesses` for the new client.
4. Seed default pipeline stages through `PUT /pipeline`.
5. Install automations via `POST /automations/install-defaults`.
6. Configure provider credentials for SMS/email adapters per environment.
7. Point the existing frontend to this API and pass `x-business-id` for every request.

### Isolation Model
All core entities contain `business_id` and every route enforces business scoping through middleware, ensuring isolated tenant datasets on shared architecture.
