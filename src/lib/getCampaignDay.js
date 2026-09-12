export function getCampaignDay({
  campaignStartDate,
  campaignEndDate,
  recordDate,
  visitDate,
  coveredDate,
  status = "recorded",
}) {
  if (!campaignStartDate) {
    return "-";
  }

  const date =
    status === "covered"
      ? coveredDate
      : status === "visited"
        ? visitDate
        : recordDate;

  if (!date) {
    return "-";
  }

  const getDateOnly = (value) => {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  const start = getDateOnly(campaignStartDate);
  const current = getDateOnly(date);
  const end = campaignEndDate ? getDateOnly(campaignEndDate) : null;

  if (!start || !current) {
    return "-";
  }

  const difference = Math.floor(
    (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  const campaignDay = difference + 1;

  if (campaignDay < 1) {
    return "-";
  }

  if (end) {
    const totalCampaignDays =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalCampaignDays > 0) {
      return Math.min(campaignDay, totalCampaignDays);
    }
  }

  return campaignDay;
}
