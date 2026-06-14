from datetime import datetime

from app.models import Incident, IncidentState


MOCK_INCIDENTS: list[Incident] = [
    Incident(
        incident_number="INC000001",
        short_description="VMware access not provisioned for new hire",
        description=(
            "New hire cannot access the VMware console after onboarding. The "
            "VMware identity record VMW10234 was created, but entitlement sync "
            "did not activate the required access profile."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Updated VMware access status for VMW10234 and re-ran entitlement "
            "sync. User confirmed console access."
        ),
        created_date=datetime(2026, 5, 1, 9, 12),
        updated_date=datetime(2026, 5, 1, 11, 30),
        assignment_group="VMware Access Provisioning",
        assigned_to="Anika Sharma",
    ),
    Incident(
        incident_number="INC000002",
        short_description="VMware entitlement missing after staff onboarding",
        description=(
            "Staff member reports VMware portal access is unavailable. The "
            "VMware ID VMW10241 exists, but the access provisioning workflow "
            "left the entitlement in pending status."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Set access status to active for VMW10241 and refreshed the VMware "
            "provisioning queue."
        ),
        created_date=datetime(2026, 5, 2, 10, 5),
        updated_date=datetime(2026, 5, 2, 12, 22),
        assignment_group="VMware Access Provisioning",
        assigned_to="Rohan Mehta",
    ),
    Incident(
        incident_number="INC000003",
        short_description="VMware console access stuck in pending state",
        description=(
            "User cannot sign in to VMware after the account was onboarded. "
            "VMware ID VMW10255 is present, but the access profile remained "
            "inactive after the nightly job."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Activated the VMware access profile for VMW10255 and confirmed "
            "successful login."
        ),
        created_date=datetime(2026, 5, 3, 8, 44),
        updated_date=datetime(2026, 5, 3, 10, 18),
        assignment_group="VMware Access Provisioning",
        assigned_to="Meera Iyer",
    ),
    Incident(
        incident_number="INC000004",
        short_description="VMware account provisioned without console access",
        description=(
            "A recently onboarded employee has a VMware identity record, but "
            "the console access entitlement has not moved out of pending status."
        ),
        state=IncidentState.WORK_IN_PROGRESS,
        resolution_notes=None,
        created_date=datetime(2026, 5, 4, 13, 15),
        updated_date=datetime(2026, 5, 4, 14, 2),
        assignment_group="VMware Access Provisioning",
        assigned_to="Nisha Rao",
    ),
    Incident(
        incident_number="INC000005",
        short_description="Active VMware access provisioning issue",
        description=(
            "Current user is unable to access the VMware console after "
            "onboarding. The VMware ID VMW10288 exists, but the expected access "
            "profile still appears inactive."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 5, 5, 9, 20),
        updated_date=datetime(2026, 5, 5, 9, 20),
        assignment_group="VMware Access Provisioning",
        assigned_to="Karan Malhotra",
    ),
    Incident(
        incident_number="INC000006",
        short_description="Policy synchronization failed for employee record",
        description=(
            "Staff policy assignment did not sync from HR policy source to the "
            "access platform. Staff ID STF21001 is missing policy POL7001 after "
            "the scheduled synchronization."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Updated policy sync status for STF21001 and replayed policy POL7001."
        ),
        created_date=datetime(2026, 5, 6, 9, 10),
        updated_date=datetime(2026, 5, 6, 10, 45),
        assignment_group="Policy Synchronization",
        assigned_to="Priya Nair",
    ),
    Incident(
        incident_number="INC000007",
        short_description="Access policy missing after synchronization job",
        description=(
            "The policy synchronization job completed, but Staff ID STF21018 "
            "does not show policy POL7002 in downstream access records."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Marked policy POL7002 for resync on STF21018 and validated the "
            "downstream access record."
        ),
        created_date=datetime(2026, 5, 7, 11, 30),
        updated_date=datetime(2026, 5, 7, 13, 5),
        assignment_group="Policy Synchronization",
        assigned_to="Arjun Kapoor",
    ),
    Incident(
        incident_number="INC000008",
        short_description="Employee policy not reflected in access platform",
        description=(
            "Staff ID STF21029 has the correct policy in the source system, but "
            "policy POL7003 was not synchronized to the access platform."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Reset synchronization status for STF21029 and replayed policy "
            "POL7003 successfully."
        ),
        created_date=datetime(2026, 5, 8, 8, 55),
        updated_date=datetime(2026, 5, 8, 10, 12),
        assignment_group="Policy Synchronization",
        assigned_to="Sneha Kulkarni",
    ),
    Incident(
        incident_number="INC000009",
        short_description="Policy assignment delayed in downstream system",
        description=(
            "Policy assignment is visible in the HR source, but the downstream "
            "access platform has not received the policy for the employee."
        ),
        state=IncidentState.WORK_IN_PROGRESS,
        resolution_notes=None,
        created_date=datetime(2026, 5, 9, 12, 4),
        updated_date=datetime(2026, 5, 9, 13, 18),
        assignment_group="Policy Synchronization",
        assigned_to="Dev Patel",
    ),
    Incident(
        incident_number="INC000010",
        short_description="Active policy synchronization failure",
        description=(
            "Current employee record shows the approved policy in the source "
            "system, but policy POL7006 has not synchronized to the access "
            "platform for Staff ID STF21064."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 5, 10, 10, 25),
        updated_date=datetime(2026, 5, 10, 10, 25),
        assignment_group="Policy Synchronization",
        assigned_to="Isha Verma",
    ),
    Incident(
        incident_number="INC000011",
        short_description="Corporate mailbox not created for new employee",
        description=(
            "New employee cannot access corporate email. Email ID "
            "maria.fernandes@example.com exists in the request, but mailbox "
            "provisioning did not complete."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Set mailbox status to active for maria.fernandes@example.com and "
            "triggered mail routing refresh."
        ),
        created_date=datetime(2026, 5, 11, 9, 40),
        updated_date=datetime(2026, 5, 11, 11, 6),
        assignment_group="Corporate Email Provisioning",
        assigned_to="Amit Joshi",
    ),
    Incident(
        incident_number="INC000012",
        short_description="Email provisioning incomplete after onboarding",
        description=(
            "User reports Outlook login failure after onboarding. Email ID "
            "liam.chen@example.com was reserved, but mailbox activation stayed "
            "pending."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Activated mailbox for liam.chen@example.com and synchronized the "
            "email directory entry."
        ),
        created_date=datetime(2026, 5, 12, 8, 30),
        updated_date=datetime(2026, 5, 12, 9, 58),
        assignment_group="Corporate Email Provisioning",
        assigned_to="Farah Khan",
    ),
    Incident(
        incident_number="INC000013",
        short_description="Mailbox remains pending for onboarded user",
        description=(
            "Corporate email access is unavailable for an onboarded user. Email "
            "ID noah.singh@example.com was created, but mailbox status did not "
            "change to active."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Updated mailbox status for noah.singh@example.com and confirmed "
            "successful Outlook sign-in."
        ),
        created_date=datetime(2026, 5, 13, 14, 5),
        updated_date=datetime(2026, 5, 13, 15, 42),
        assignment_group="Corporate Email Provisioning",
        assigned_to="Ritu Bansal",
    ),
    Incident(
        incident_number="INC000014",
        short_description="Corporate email account stuck before activation",
        description=(
            "Employee has a corporate email reservation, but the mailbox is not "
            "active and the user cannot access Outlook or mobile mail."
        ),
        state=IncidentState.WORK_IN_PROGRESS,
        resolution_notes=None,
        created_date=datetime(2026, 5, 14, 10, 50),
        updated_date=datetime(2026, 5, 14, 12, 0),
        assignment_group="Corporate Email Provisioning",
        assigned_to="Sahil Gupta",
    ),
    Incident(
        incident_number="INC000015",
        short_description="Active corporate email provisioning issue",
        description=(
            "Current onboarding user cannot access corporate email. Email ID "
            "ava.martin@example.com is reserved, but mailbox provisioning is "
            "still pending."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 5, 15, 9, 15),
        updated_date=datetime(2026, 5, 15, 9, 15),
        assignment_group="Corporate Email Provisioning",
        assigned_to="Tanvi Shah",
    ),
    Incident(
        incident_number="INC000016",
        short_description="User role missing in finance application",
        description=(
            "User ID USR33001 cannot access finance approval screens. The role "
            "assignment request completed, but the application role remained "
            "inactive."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Activated requested role for USR33001 and refreshed application "
            "permissions."
        ),
        created_date=datetime(2026, 5, 16, 11, 5),
        updated_date=datetime(2026, 5, 16, 12, 35),
        assignment_group="Role Assignment Support",
        assigned_to="Neel Desai",
    ),
    Incident(
        incident_number="INC000017",
        short_description="Approved role not applied to user profile",
        description=(
            "User ID USR33014 has an approved role request, but the assigned "
            "application role is not visible in the user profile."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Updated role status for USR33014 and reloaded the application "
            "authorization cache."
        ),
        created_date=datetime(2026, 5, 17, 9, 22),
        updated_date=datetime(2026, 5, 17, 10, 48),
        assignment_group="Role Assignment Support",
        assigned_to="Pooja Menon",
    ),
    Incident(
        incident_number="INC000018",
        short_description="Role assignment stuck after manager approval",
        description=(
            "Manager approved access for User ID USR33027, but the target role "
            "did not activate in the business application."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Set role assignment to active for USR33027 and validated access in "
            "the application."
        ),
        created_date=datetime(2026, 5, 18, 15, 10),
        updated_date=datetime(2026, 5, 18, 16, 25),
        assignment_group="Role Assignment Support",
        assigned_to="Harsh Vardhan",
    ),
    Incident(
        incident_number="INC000019",
        short_description="Application role pending after approval workflow",
        description=(
            "A user has completed approval for application access, but the "
            "assigned role still shows pending and screens remain unavailable."
        ),
        state=IncidentState.WORK_IN_PROGRESS,
        resolution_notes=None,
        created_date=datetime(2026, 5, 19, 13, 42),
        updated_date=datetime(2026, 5, 19, 14, 20),
        assignment_group="Role Assignment Support",
        assigned_to="Lavanya Krishnan",
    ),
    Incident(
        incident_number="INC000020",
        short_description="Active role assignment issue",
        description=(
            "Current user cannot access approved application functions. User ID "
            "USR33061 has an approved request, but the assigned role remains "
            "inactive."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 5, 20, 10, 35),
        updated_date=datetime(2026, 5, 20, 10, 35),
        assignment_group="Role Assignment Support",
        assigned_to="Kabir Sethi",
    ),
    Incident(
        incident_number="INC000021",
        short_description="Claims batch failed during processing",
        description=(
            "Claims batch for Policy ID POL91001 failed validation during "
            "processing. The policy is active, but the batch status remained "
            "blocked."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Cleared blocked processing status for POL91001 and replayed the "
            "claims batch."
        ),
        created_date=datetime(2026, 5, 21, 8, 20),
        updated_date=datetime(2026, 5, 21, 9, 50),
        assignment_group="Claims Processing Support",
        assigned_to="Maya Thomas",
    ),
    Incident(
        incident_number="INC000022",
        short_description="Claim stuck because policy processing flag is blocked",
        description=(
            "Policy ID POL91012 is active, but claims processing stopped with a "
            "blocked status and the submitted claim did not advance."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Updated processing flag for POL91012 and restarted the claim "
            "workflow."
        ),
        created_date=datetime(2026, 5, 22, 12, 10),
        updated_date=datetime(2026, 5, 22, 13, 33),
        assignment_group="Claims Processing Support",
        assigned_to="Omar Sheikh",
    ),
    Incident(
        incident_number="INC000023",
        short_description="Claims workflow failed for active policy",
        description=(
            "Claim submission did not complete for Policy ID POL91027. The "
            "processing record was left in blocked status despite valid policy "
            "coverage."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Reset blocked status for POL91027 and reprocessed the failed claim."
        ),
        created_date=datetime(2026, 5, 23, 9, 8),
        updated_date=datetime(2026, 5, 23, 10, 44),
        assignment_group="Claims Processing Support",
        assigned_to="Diya Rao",
    ),
    Incident(
        incident_number="INC000024",
        short_description="Claim remains blocked for eligible policy",
        description=(
            "A submitted claim is not progressing even though the policy is "
            "eligible. The processing status remains blocked in the claims "
            "system."
        ),
        state=IncidentState.WORK_IN_PROGRESS,
        resolution_notes=None,
        created_date=datetime(2026, 5, 24, 14, 18),
        updated_date=datetime(2026, 5, 24, 15, 9),
        assignment_group="Claims Processing Support",
        assigned_to="Vikram Anand",
    ),
    Incident(
        incident_number="INC000025",
        short_description="Active claims processing failure",
        description=(
            "Current claim for Policy ID POL91066 is failing to process. The "
            "policy is active, but the claim remains blocked in the processing "
            "queue."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 5, 25, 10, 2),
        updated_date=datetime(2026, 5, 25, 10, 2),
        assignment_group="Claims Processing Support",
        assigned_to="Aarav Jain",
    ),
    Incident(
        incident_number="INC000026",
        short_description="Customer account locked after failed login attempts",
        description=(
            "Customer account for User ID CUS44001 is locked after repeated "
            "failed login attempts. The unlock workflow did not release the "
            "account automatically."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Cleared lock status for CUS44001 and reset the failed login counter."
        ),
        created_date=datetime(2026, 5, 26, 9, 18),
        updated_date=datetime(2026, 5, 26, 10, 21),
        assignment_group="Customer Account Support",
        assigned_to="Sara D'Souza",
    ),
    Incident(
        incident_number="INC000027",
        short_description="Customer unable to sign in because account is locked",
        description=(
            "User ID CUS44013 remains locked after password reset. The account "
            "unlock flag did not update and customer login is blocked."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Updated account lock flag for CUS44013 and cleared authentication "
            "failure count."
        ),
        created_date=datetime(2026, 5, 27, 11, 12),
        updated_date=datetime(2026, 5, 27, 12, 40),
        assignment_group="Customer Account Support",
        assigned_to="Rahul Bose",
    ),
    Incident(
        incident_number="INC000028",
        short_description="Locked customer profile not released after reset",
        description=(
            "Customer completed password reset, but User ID CUS44029 is still "
            "locked and cannot authenticate to the portal."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Unlocked customer profile CUS44029 and synchronized authentication "
            "status."
        ),
        created_date=datetime(2026, 5, 28, 8, 48),
        updated_date=datetime(2026, 5, 28, 10, 3),
        assignment_group="Customer Account Support",
        assigned_to="Jaya Pillai",
    ),
    Incident(
        incident_number="INC000029",
        short_description="Customer account remains locked after reset",
        description=(
            "Customer cannot access the portal after reset because the account "
            "lock status remains active in authentication records."
        ),
        state=IncidentState.WORK_IN_PROGRESS,
        resolution_notes=None,
        created_date=datetime(2026, 5, 29, 13, 0),
        updated_date=datetime(2026, 5, 29, 13, 47),
        assignment_group="Customer Account Support",
        assigned_to="Manav Bhatia",
    ),
    Incident(
        incident_number="INC000030",
        short_description="Active customer account lock issue",
        description=(
            "Current customer cannot sign in after password reset. User ID "
            "CUS44072 remains locked and the failed login counter still appears "
            "active."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 5, 30, 9, 55),
        updated_date=datetime(2026, 5, 30, 9, 55),
        assignment_group="Customer Account Support",
        assigned_to="Leena George",
    ),
    
    # 40-45 : Incidents with empty description or short description

    Incident(
        incident_number="INC000040",
        short_description="",
        description="",
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 1, 9, 0),
        updated_date=datetime(2026, 6, 1, 9, 0),
        assignment_group="Application Support",
        assigned_to="Rahul Nair",
    ),

    Incident(
        incident_number="INC000041",
        short_description="Login issue",
        description="",
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 1, 9, 15),
        updated_date=datetime(2026, 6, 1, 9, 15),
        assignment_group="Service Desk",
        assigned_to="Priya Menon",
    ),

    Incident(
        incident_number="INC000042",
        short_description="",
        description="User reported a problem.",
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 1, 9, 30),
        updated_date=datetime(2026, 6, 1, 9, 30),
        assignment_group="IT Operations",
        assigned_to="Ankit Sharma",
    ),

    Incident(
        incident_number="INC000043",
        short_description="Error",
        description="",
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 1, 9, 45),
        updated_date=datetime(2026, 6, 1, 9, 45),
        assignment_group="Application Support",
        assigned_to="Sneha Roy",
    ),

    Incident(
        incident_number="INC000044",
        short_description="System issue",
        description="Issue observed.",
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 1, 10, 0),
        updated_date=datetime(2026, 6, 1, 10, 0),
        assignment_group="Infrastructure Support",
        assigned_to="Vikram Das",
    ),

    Incident(
        incident_number="INC000045",
        short_description="",
        description="",
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 1, 10, 15),
        updated_date=datetime(2026, 6, 1, 10, 15),
        assignment_group="Service Desk",
        assigned_to="Neha Kapoor",
    ),


    # 50-55 : Unique OPEN incidents

    Incident(
        incident_number="INC000050",
        short_description="Payment settlement batch not completing",
        description=(
            "The nightly payment settlement process remains in a running state "
            "for over four hours. Multiple transactions are awaiting settlement "
            "confirmation, affecting reconciliation reports."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 2, 8, 30),
        updated_date=datetime(2026, 6, 2, 8, 30),
        assignment_group="Payments Platform",
        assigned_to="Arjun Pillai",
    ),

    Incident(
        incident_number="INC000051",
        short_description="Employee VPN connection failing",
        description=(
            "Remote employees are unable to establish VPN sessions. Authentication "
            "succeeds but the tunnel disconnects immediately after connection."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 2, 9, 15),
        updated_date=datetime(2026, 6, 2, 9, 15),
        assignment_group="Network Operations",
        assigned_to="Rohit Mehta",
    ),

    Incident(
        incident_number="INC000052",
        short_description="Inventory synchronization delay",
        description=(
            "Product stock updates from retail stores are not reaching the central "
            "inventory database. Quantities shown online differ from store records."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 2, 10, 0),
        updated_date=datetime(2026, 6, 2, 10, 0),
        assignment_group="Retail Systems",
        assigned_to="Asha Nambiar",
    ),

    Incident(
        incident_number="INC000053",
        short_description="Email attachments blocked unexpectedly",
        description=(
            "Several users report that PDF attachments are being rejected by the "
            "mail gateway even though the files pass antivirus scanning."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 2, 10, 45),
        updated_date=datetime(2026, 6, 2, 10, 45),
        assignment_group="Messaging Services",
        assigned_to="Karthik Rao",
    ),

    Incident(
        incident_number="INC000054",
        short_description="Analytics dashboard displaying stale data",
        description=(
            "Business intelligence dashboards have not refreshed since yesterday. "
            "Scheduled ETL jobs appear successful but new metrics are missing."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 2, 11, 30),
        updated_date=datetime(2026, 6, 2, 11, 30),
        assignment_group="Data Engineering",
        assigned_to="Divya Nair",
    ),

    Incident(
        incident_number="INC000055",
        short_description="Warehouse barcode scanners not syncing",
        description=(
            "Barcode scanners in the east distribution center can scan items "
            "locally but fail to upload transaction records to the backend system."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 2, 12, 15),
        updated_date=datetime(2026, 6, 2, 12, 15),
        assignment_group="Warehouse Technology",
        assigned_to="Manoj Kumar",
    ),


    # 60-65 : Semantically similar to 50-55 respectively

    Incident(
        incident_number="INC000060",
        short_description="Financial transaction reconciliation queue stuck",
        description=(
            "End-of-day transaction reconciliation jobs are not completing. "
            "Several payment records remain pending in the processing queue, "
            "delaying account settlement activities."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 3, 8, 20),
        updated_date=datetime(2026, 6, 3, 8, 20),
        assignment_group="Payments Platform",
        assigned_to="Arjun Pillai",
    ),

    Incident(
        incident_number="INC000061",
        short_description="Corporate remote access disconnecting after login",
        description=(
            "Users working from home can authenticate successfully to the remote "
            "access gateway, but their VPN sessions terminate within seconds."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 3, 9, 10),
        updated_date=datetime(2026, 6, 3, 9, 10),
        assignment_group="Network Operations",
        assigned_to="Rohit Mehta",
    ),

    Incident(
        incident_number="INC000062",
        short_description="Stock level updates not reaching master inventory",
        description=(
            "Inventory changes recorded in branch locations are not propagating "
            "to the central stock management system, causing quantity mismatches."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 3, 10, 0),
        updated_date=datetime(2026, 6, 3, 10, 0),
        assignment_group="Retail Systems",
        assigned_to="Asha Nambiar",
    ),

    Incident(
        incident_number="INC000063",
        short_description="Mail server rejecting document attachments",
        description=(
            "Employees are unable to send PDF documents through email. The mail "
            "filter blocks attachments despite no malware being detected."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 3, 10, 50),
        updated_date=datetime(2026, 6, 3, 10, 50),
        assignment_group="Messaging Services",
        assigned_to="Karthik Rao",
    ),

    Incident(
        incident_number="INC000064",
        short_description="Reporting portal not showing latest metrics",
        description=(
            "Management reports continue to display yesterday's figures. Data "
            "refresh pipelines appear to run successfully but dashboard values "
            "remain unchanged."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 3, 11, 40),
        updated_date=datetime(2026, 6, 3, 11, 40),
        assignment_group="Data Engineering",
        assigned_to="Divya Nair",
    ),

    Incident(
        incident_number="INC000065",
        short_description="Handheld scanners unable to upload warehouse transactions",
        description=(
            "Scanning devices used in the fulfillment center capture item movements "
            "correctly but fail to synchronize transaction logs with the backend."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 6, 3, 12, 25),
        updated_date=datetime(2026, 6, 3, 12, 25),
        assignment_group="Warehouse Technology",
        assigned_to="Manoj Kumar",
    ),

    # ==========================================
    # GROUP 1 - Order Status Synchronization Issue
    # ==========================================

    Incident(
        incident_number="SCTASK071",
        short_description="Order remains in processing after payment confirmation",
        description=(
            "Customer order ORD50121 shows successful payment in the payment "
            "system, but the order status remains PROCESSING. The fulfillment "
            "workflow was not triggered automatically."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Updated the order status to READY_FOR_FULFILLMENT and replayed the "
            "order synchronization process. Fulfillment workflow started successfully."
        ),
        created_date=datetime(2026, 5, 21, 9, 15),
        updated_date=datetime(2026, 5, 21, 11, 20),
        assignment_group="Order Processing Support",
        assigned_to="Aarav Singh",
    ),

    Incident(
        incident_number="SCTASK072",
        short_description="Paid order not progressing to fulfillment stage",
        description=(
            "Order ORD50134 was successfully charged, but the order management "
            "system still displays the transaction in processing status. The "
            "fulfillment event was never generated."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Corrected the order status and re-triggered the fulfillment event. "
            "Order moved successfully to fulfillment."
        ),
        created_date=datetime(2026, 5, 22, 10, 5),
        updated_date=datetime(2026, 5, 22, 12, 12),
        assignment_group="Order Processing Support",
        assigned_to="Neha Verma",
    ),

    Incident(
        incident_number="SCTASK073",
        short_description="Order workflow stalled after successful payment",
        description=(
            "Customer reports delayed shipment for order ORD50148. Payment was "
            "captured successfully, but status synchronization between payment "
            "and order systems failed."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Replayed the synchronization job and updated the order status. "
            "Shipment generation resumed normally."
        ),
        created_date=datetime(2026, 5, 23, 8, 40),
        updated_date=datetime(2026, 5, 23, 10, 25),
        assignment_group="Order Processing Support",
        assigned_to="Rahul Nair",
    ),

    Incident(
        incident_number="SCTASK074",
        short_description="Order processing status under investigation",
        description=(
            "Order ORD50163 has completed payment validation, but the order "
            "continues to remain in processing state. Investigation is underway "
            "to determine why fulfillment was not initiated."
        ),
        state=IncidentState.WORK_IN_PROGRESS,
        resolution_notes=None,
        created_date=datetime(2026, 5, 24, 13, 5),
        updated_date=datetime(2026, 5, 24, 14, 10),
        assignment_group="Order Processing Support",
        assigned_to="Priya Kulkarni",
    ),

    Incident(
        incident_number="SCTASK075",
        short_description="Customer order stuck in processing queue",
        description=(
            "Order ORD50179 is visible in the processing queue despite successful "
            "payment completion. The order has not advanced to the next stage of "
            "the fulfillment workflow."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 5, 25, 9, 30),
        updated_date=datetime(2026, 5, 25, 9, 30),
        assignment_group="Order Processing Support",
        assigned_to="Siddharth Rao",
    ),

    # ==========================================
    # GROUP 2 - Employee Badge Access Sync Issue
    # ==========================================

    Incident(
        incident_number="SCTASK076",
        short_description="Employee badge remains inactive after approval",
        description=(
            "Employee badge BDG89011 was approved during onboarding, but the "
            "physical access system still shows the badge as inactive."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Activated the badge record and reprocessed the access synchronization "
            "job. Employee successfully accessed the facility."
        ),
        created_date=datetime(2026, 5, 26, 9, 20),
        updated_date=datetime(2026, 5, 26, 11, 5),
        assignment_group="Physical Access Management",
        assigned_to="Kavya Menon",
    ),

    Incident(
        incident_number="SCTASK077",
        short_description="Building access card not activated after onboarding",
        description=(
            "New employee reports inability to enter authorized office areas. "
            "Badge ID BDG89025 exists in the access management system, but the "
            "activation workflow did not complete."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Updated badge status to active and replayed the onboarding sync process."
        ),
        created_date=datetime(2026, 5, 27, 10, 10),
        updated_date=datetime(2026, 5, 27, 12, 1),
        assignment_group="Physical Access Management",
        assigned_to="Imran Khan",
    ),

    Incident(
        incident_number="SCTASK078",
        short_description="Badge entitlement synchronization failure",
        description=(
            "Employee badge BDG89039 is assigned to the user, but access rights "
            "were not synchronized to the door access control platform."
        ),
        state=IncidentState.RESOLVED,
        resolution_notes=(
            "Re-synchronized badge entitlements and verified successful door access."
        ),
        created_date=datetime(2026, 5, 28, 8, 55),
        updated_date=datetime(2026, 5, 28, 10, 35),
        assignment_group="Physical Access Management",
        assigned_to="Sana Ali",
    ),

    Incident(
        incident_number="SCTASK079",
        short_description="Badge activation request pending investigation",
        description=(
            "Badge BDG89052 was generated during onboarding, but remains inactive "
            "in the physical access platform. Root cause analysis is ongoing."
        ),
        state=IncidentState.WORK_IN_PROGRESS,
        resolution_notes=None,
        created_date=datetime(2026, 5, 29, 13, 20),
        updated_date=datetime(2026, 5, 29, 14, 12),
        assignment_group="Physical Access Management",
        assigned_to="Tushar Jain",
    ),

    Incident(
        incident_number="SCTASK080",
        short_description="Employee access badge not yet activated",
        description=(
            "Employee cannot access assigned office zones because badge "
            "BDG89068 remains inactive even though onboarding approval was completed."
        ),
        state=IncidentState.OPEN,
        resolution_notes=None,
        created_date=datetime(2026, 5, 30, 9, 5),
        updated_date=datetime(2026, 5, 30, 9, 5),
        assignment_group="Physical Access Management",
        assigned_to="Ritika Sharma",
    ),
]