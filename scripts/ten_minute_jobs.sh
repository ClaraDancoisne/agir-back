curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/services/process_async_service
curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/utilisateurs/compute_classement
#curl -H "Authorization: Bearer ${CRON_API_KEY}" -d "" ${BASE_URL}/admin/compute_reco_tags