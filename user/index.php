<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VAP – Blockbuster Sessions</title>
<link rel="stylesheet" href="user_style.css">
</head>
<body>

<div class="page-wrap">

  <div class="banner-wrap" id="bannerWrap">
    <div class="banner-placeholder" id="bannerPlaceholder">
      No banner available
    </div>
    <img id="bannerImg" class="banner-img" src="" alt="Event banner" style="display:none;">
  </div>

  <div class="intro-block">
    <div class="intro-text" data-key="introText" id="introText">
      Join VA Platinum's Blockbuster Session - a quick, impactful 30-minute interaction with our team members.

      Per session is limited to one participant only. Participation will be on a first come, first served basis.

      Please notify us at least 72 hours in advance if you cannot attend.

      Unnotified no-shows may impact your eligibility for future sessions.
    </div>
  </div>

</div>

<div class="cards-wrap">
  <div class="card" id="bookingSection">
    <div class="card-title" data-key="formHeading">BOOK YOUR SESSION</div>

    <form id="bookingForm" novalidate>

      <div class="form-grid-2">
        <div class="field">
          <label>First Name <span class="req">***</span></label>
          <input type="text" id="f_firstName">
        </div>

        <div class="field">
          <label>Last Name <span class="req">***</span></label>
          <input type="text" id="f_lastName">
        </div>
      </div>

      <div class="form-grid-1">
        <div class="field">
          <label>Company Name <span class="req">***</span></label>
          <input type="text" id="f_company">
        </div>
      </div>

      <div class="form-grid-2">
        <div class="field">
          <label>Email <span class="req">***</span></label>
          <input type="email" id="f_email">
        </div>

        <div class="field">
          <label>Phone <span class="req">***</span></label>
          <input type="tel" id="f_phone">
        </div>
      </div>

      <div class="form-grid-1">
        <div class="field">
          <label>Please pick a date and time <span class="req">***</span></label>

          <div class="slot-select-wrap">
            <select id="f_slot"></select>

            <div class="slot-availability" id="slotAvailability">
              <span class="slot-availability-dot"></span>
              <span id="slotAvailabilityText">Available slots</span>
            </div>
          </div>
        </div>
      </div>

      <div class="form-grid-1">
        <div class="field">
          <label>TOPICS TO ASK/DISCUSS <span class="req">***</span></label>

          <div class="topics-hint" data-key="topicsHint">
            Kindly write topics and questions you would like to ask Brian Jones here:
          </div>

          <textarea id="f_topics"></textarea>
        </div>
      </div>

      <button type="submit" class="btn-submit">
        <span data-key="submitLabel">Submit</span>
      </button>

    </form>
  </div>
</div>

<script src="user.js"></script>

</body>
</html>