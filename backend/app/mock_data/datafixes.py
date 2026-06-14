from app.models import Datafix


MOCK_DATAFIXES: list[Datafix] = [
    Datafix(
        datafix_id="DFX000001",
        incident_number="INC000001",
        description="Activate VMware access profile for the provisioned user.",
        datafix_code=(
            "UPDATE USER_ACCESS\n"
            "SET ACCESS_STATUS='ACTIVE'\n"
            "WHERE VMWARE_ID='VMW10234';"
        ),
    ),
    Datafix(
        datafix_id="DFX000002",
        incident_number="INC000002",
        description="Activate VMware entitlement after onboarding sync delay.",
        datafix_code=(
            "UPDATE USER_ACCESS\n"
            "SET ACCESS_STATUS='ACTIVE'\n"
            "WHERE VMWARE_ID='VMW10241';"
        ),
    ),
    Datafix(
        datafix_id="DFX000003",
        incident_number="INC000003",
        description="Activate VMware console profile left inactive by sync.",
        datafix_code=(
            "UPDATE USER_ACCESS\n"
            "SET ACCESS_STATUS='ACTIVE'\n"
            "WHERE VMWARE_ID='VMW10255';"
        ),
    ),
    Datafix(
        datafix_id="DFX000004",
        incident_number="INC000006",
        description="Mark policy assignment ready for downstream synchronization.",
        datafix_code=(
            "UPDATE STAFF_POLICY_SYNC\n"
            "SET SYNC_STATUS='READY_FOR_REPLAY'\n"
            "WHERE STAFF_ID='STF21001'\n"
            "AND POLICY_ID='POL7001';"
        ),
    ),
    Datafix(
        datafix_id="DFX000005",
        incident_number="INC000007",
        description="Reset policy synchronization status for replay.",
        datafix_code=(
            "UPDATE STAFF_POLICY_SYNC\n"
            "SET SYNC_STATUS='READY_FOR_REPLAY'\n"
            "WHERE STAFF_ID='STF21018'\n"
            "AND POLICY_ID='POL7002';"
        ),
    ),
    Datafix(
        datafix_id="DFX000006",
        incident_number="INC000008",
        description="Replay missing policy assignment to access platform.",
        datafix_code=(
            "UPDATE STAFF_POLICY_SYNC\n"
            "SET SYNC_STATUS='READY_FOR_REPLAY'\n"
            "WHERE STAFF_ID='STF21029'\n"
            "AND POLICY_ID='POL7003';"
        ),
    ),
    Datafix(
        datafix_id="DFX000007",
        incident_number="INC000011",
        description="Activate corporate mailbox for provisioned email account.",
        datafix_code=(
            "UPDATE EMAIL_PROVISIONING\n"
            "SET MAILBOX_STATUS='ACTIVE'\n"
            "WHERE EMAIL_ID='maria.fernandes@example.com';"
        ),
    ),
    Datafix(
        datafix_id="DFX000008",
        incident_number="INC000012",
        description="Complete mailbox activation for reserved email account.",
        datafix_code=(
            "UPDATE EMAIL_PROVISIONING\n"
            "SET MAILBOX_STATUS='ACTIVE'\n"
            "WHERE EMAIL_ID='liam.chen@example.com';"
        ),
    ),
    Datafix(
        datafix_id="DFX000009",
        incident_number="INC000013",
        description="Activate mailbox that remained pending after onboarding.",
        datafix_code=(
            "UPDATE EMAIL_PROVISIONING\n"
            "SET MAILBOX_STATUS='ACTIVE'\n"
            "WHERE EMAIL_ID='noah.singh@example.com';"
        ),
    ),
    Datafix(
        datafix_id="DFX000010",
        incident_number="INC000016",
        description="Activate approved application role for the user.",
        datafix_code=(
            "UPDATE USER_ROLE_ASSIGNMENT\n"
            "SET ROLE_STATUS='ACTIVE'\n"
            "WHERE USER_ID='USR33001';"
        ),
    ),
    Datafix(
        datafix_id="DFX000011",
        incident_number="INC000017",
        description="Apply approved role assignment to the user profile.",
        datafix_code=(
            "UPDATE USER_ROLE_ASSIGNMENT\n"
            "SET ROLE_STATUS='ACTIVE'\n"
            "WHERE USER_ID='USR33014';"
        ),
    ),
    Datafix(
        datafix_id="DFX000012",
        incident_number="INC000018",
        description="Activate role assignment after manager approval.",
        datafix_code=(
            "UPDATE USER_ROLE_ASSIGNMENT\n"
            "SET ROLE_STATUS='ACTIVE'\n"
            "WHERE USER_ID='USR33027';"
        ),
    ),
    Datafix(
        datafix_id="DFX000013",
        incident_number="INC000021",
        description="Release blocked claims processing for active policy.",
        datafix_code=(
            "UPDATE CLAIMS_PROCESSING\n"
            "SET PROCESSING_STATUS='READY_FOR_REPLAY'\n"
            "WHERE POLICY_ID='POL91001';"
        ),
    ),
    Datafix(
        datafix_id="DFX000014",
        incident_number="INC000022",
        description="Reset blocked claims workflow for policy claim replay.",
        datafix_code=(
            "UPDATE CLAIMS_PROCESSING\n"
            "SET PROCESSING_STATUS='READY_FOR_REPLAY'\n"
            "WHERE POLICY_ID='POL91012';"
        ),
    ),
    Datafix(
        datafix_id="DFX000015",
        incident_number="INC000023",
        description="Prepare failed claim for replay after validation block.",
        datafix_code=(
            "UPDATE CLAIMS_PROCESSING\n"
            "SET PROCESSING_STATUS='READY_FOR_REPLAY'\n"
            "WHERE POLICY_ID='POL91027';"
        ),
    ),
    Datafix(
        datafix_id="DFX000016",
        incident_number="INC000026",
        description="Unlock customer account and clear failed login counter.",
        datafix_code=(
            "UPDATE CUSTOMER_ACCOUNT\n"
            "SET ACCOUNT_STATUS='ACTIVE', FAILED_LOGIN_COUNT=0\n"
            "WHERE USER_ID='CUS44001';"
        ),
    ),
    Datafix(
        datafix_id="DFX000017",
        incident_number="INC000027",
        description="Release customer account lock after password reset.",
        datafix_code=(
            "UPDATE CUSTOMER_ACCOUNT\n"
            "SET ACCOUNT_STATUS='ACTIVE', FAILED_LOGIN_COUNT=0\n"
            "WHERE USER_ID='CUS44013';"
        ),
    ),
    Datafix(
        datafix_id="DFX000018",
        incident_number="INC000028",
        description="Unlock customer profile and reset authentication counter.",
        datafix_code=(
            "UPDATE CUSTOMER_ACCOUNT\n"
            "SET ACCOUNT_STATUS='ACTIVE', FAILED_LOGIN_COUNT=0\n"
            "WHERE USER_ID='CUS44029';"
        ),
    ),
    Datafix(
        datafix_id="DFX000071",
        incident_number="SCTASK071",
        description="Update order status and restart fulfillment workflow.",
        datafix_code=(
            "UPDATE CUSTOMER_ORDER\n"
            "SET ORDER_STATUS='READY_FOR_FULFILLMENT'\n"
            "WHERE ORDER_ID='ORD50121';"
        ),
    ),

    Datafix(
        datafix_id="DFX000072",
        incident_number="SCTASK072",
        description="Correct order status after payment synchronization failure.",
        datafix_code=(
            "UPDATE CUSTOMER_ORDER\n"
            "SET ORDER_STATUS='READY_FOR_FULFILLMENT'\n"
            "WHERE ORDER_ID='ORD50134';"
        ),
    ),

    Datafix(
        datafix_id="DFX000073",
        incident_number="SCTASK073",
        description="Recover order workflow after synchronization failure.",
        datafix_code=(
            "UPDATE CUSTOMER_ORDER\n"
            "SET ORDER_STATUS='READY_FOR_FULFILLMENT'\n"
            "WHERE ORDER_ID='ORD50148';"
        ),
    ),

    Datafix(
        datafix_id="DFX000076",
        incident_number="SCTASK076",
        description="Activate employee badge after onboarding synchronization issue.",
        datafix_code=(
            "UPDATE EMPLOYEE_BADGE\n"
            "SET ACCESS_STATUS='ACTIVE'\n"
            "WHERE BADGE_ID='BDG89011';"
        ),
    ),

    Datafix(
        datafix_id="DFX000077",
        incident_number="SCTASK077",
        description="Activate building access card pending onboarding completion.",
        datafix_code=(
            "UPDATE EMPLOYEE_BADGE\n"
            "SET ACCESS_STATUS='ACTIVE'\n"
            "WHERE BADGE_ID='BDG89025';"
        ),
    ),

    Datafix(
        datafix_id="DFX000078",
        incident_number="SCTASK078",
        description="Synchronize employee badge entitlements.",
        datafix_code=(
            "UPDATE EMPLOYEE_BADGE\n"
            "SET ACCESS_STATUS='ACTIVE'\n"
            "WHERE BADGE_ID='BDG89039';"
        ),
    ),
]

