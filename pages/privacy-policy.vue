<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Constants */
import { PRIVACY_POLICY_DATE } from "@/services/constants/legal.js"

useHead({
	title: "Privacy Policy",
})

/**
 * 
 * When updating the document, don't forget to change the date in the constants.
 * 
 */

const lastUpdate = () => {
	const dt = DateTime.fromISO(PRIVACY_POLICY_DATE)
	const day = dt.day
	const suffix =
		day % 10 === 1 && day !== 11 ? 'st' :
		day % 10 === 2 && day !== 12 ? 'nd' :
		day % 10 === 3 && day !== 13 ? 'rd' : 'th'

	return dt.toFormat(`LLLL d'${suffix}', yyyy`)
}
</script>

<template>
	<Flex direction="column" align="start" gap="24" :class="$style.wrapper" wide>
		<Flex direction="column" gap="6" wide>
			<Text color="primary" size="18" :style="{fontWeight: 800}">Privacy Policy</Text>
			<Text color="tertiary" size="12"> {{ `Last Updated: ${lastUpdate()}` }} </Text>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">1. General information</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">BB Strategy Pte. Ltd, a Singapore corporation, having its registered office at 165b Telok Ayer St, 068617 Singapore, (“<b>Company</b>”, “<b>we</b>”, or “<b>us</b>”) is the operator of the Website <a href="https://celenium.io" :class="$style.link">https://celenium.io</a> (the “<b>Website</b>”).</Text>

				<Text :class="$style.section_paragraph">As the operator of the Website, we take the protection of your personal data very seriously. We collect, process, and use your personal data in accordance with this privacy policy and in compliance with the Swiss Federal Act on Data Protection (“FADP”), the Swiss Ordinance to the Federal Act on Data Protection (“OFADP”), and the General European Data Protection Regulation (“GDPR”).</Text>

				<Text :class="$style.section_paragraph">This privacy policy (“Privacy Policy”) will provide you with information about the collection, processing and use of your personal data when using the Website, obtain services from us, interact with us in relation to a contract, communicate with us or otherwise deal with us. When appropriate we will provide a just-in-time notice to cover any additional processing activities not mentioned in this Privacy Policy. In addition, we may inform you about the processing of your personal data separately, for example in consent forms, terms and conditions, forms and other notices or provide a reference to this Privacy Policy or additional privacy notices.</Text>

				<Text :class="$style.section_paragraph">In case you provide us with the personal data of third persons (such as family members or work colleagues, etc.) you should make sure that these persons are familiar with this Privacy Policy and you should only share their personal data if you have permission to do so and ensure that his personal data is correct. When you share data about third persons with us, you confirm that.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">2. Controller for processing of your personal data</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">BB Strategy Pte. Ltd is the controller for the processing under this Privacy Policy unless we tell you otherwise in an individual case.</Text>

				<Text :class="$style.section_paragraph">For any matters, relating to data protection and to exercise your rights under Section 13, you may contact <a href="mailto:celenium@baking-bad.org" :class="$style.link">celenium@baking-bad.org</a> in writing by e-mail or letter to the following address: BB Strategy Pte. Ltd, 165b Telok Ayer St, 068617 Singapore</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">3. What personal data do we process?</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">We process various categories of personal data about you. The main categories of personal data are the following:</Text>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">3.1 Technical data</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">When you visit our Website, the hosting provider of our Website may automatically collects and stores various information in server log files that your browser transmits to us. The following technical data may be recorded by us, as usual with every connection with a web server, without your intervention, and stored by the hosting provider:</Text>

					<ul>
						<li>Terminal device ID, type, operating system, date, time, region, country, latitude, longitude</li>
						<li>Browser type, user agent, language, screen resolution</li>
						<li>IP address, network provider, traffic routing data, system configuration information, and other information about traffic to and from the Website</li>
						<li>Mouse movements, clicks, scrolling behavior</li>
						<li>Keystrokes (excluding sensitive fields such as passwords)</li>
						<li>Pages visited, time spent, and navigation paths</li>
					</ul>

					<Text :class="$style.section_paragraph">Any collection and processing of this technical data is for the purpose of enabling the use and functionality of our Website, continuously ensuring system security and stability, optimising our Website, to show you Website customized for your region, and for internal statistical purposes. Furthermore, the collection of technical data shall ensure the functionality and security of our services.</Text>
					<Text :class="$style.section_paragraph">Technical data is not assigned to specific persons nor linked to data from other sources. So technical data as such does not permit us to draw conclusions about your identity. However, technical data may be linked with other categories of data (and potentially with your person) in relation to user accounts, registrations, access controls or the performance of a contract.</Text>
					<Text :class="$style.section_paragraph">Furthermore, the IP addresses may be evaluated, together with other data, in case of attacks on the network infrastructure or other unauthorised use or misuse of the Website, for the purpose of intelligence and protection, and if appropriate, used in criminal proceedings for identification and civil and criminal proceedings against the relevant users.</Text>
					<Text :class="$style.section_paragraph">In order to ensure the functionality of our services, we may also assign an individual code to you or your terminal device (for example as a cookie). Cookies are text files that are stored in a computer system via an Internet browser. More detailed information on cookies and how they work can be found at: <a href="http://www.allaboutcookies.org" target="_blank" :class="$style.link">http://www.allaboutcookies.org</a> and section 4.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">3.2 Communication Data</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">When you are in contact with us via our Website’s contact form or by e-mail, telephone or chat, or by letter or other means of communication, we collect the data exchanged between you and us, including your contact details and the metadata of the communication (like the name, contact details, the means, place and time of communication and its content like the content of e-mails, letters, chats, etc.). If we have to determine your identity, for example in relation to a request for information regarding personal data or a request for press access, etc. we collect personal data to identify you.</Text>
					<Text :class="$style.section_paragraph">We use this data, which you may give voluntarily, only in order to answer your contact question / request in the best possible manner.</Text>
					<Text :class="$style.section_paragraph">We generally keep your communication data for <u>12 months</u> from the last exchange between us. This period may be longer where required for evidentiary purposes, to comply with legal or contractual requirements. E-mails in personal mailboxes, written correspondence and chats are generally kept for <u>2 years</u>.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">3.3 Master Data</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">Master data is the basic data we need, in addition to contract data (see below), for the performance of our contractual and other business relationships or services, such as name and contact details, and information about, for example, your role and function.</Text>
					<Text :class="$style.section_paragraph">We process your master data if you are a customer or other business contact or work for one or because we wish to address you for our own purposes or for the purposes of a contractual partner. We receive master data from you (for example as part of a registration), from parties you work for, or from third parties such as contractual partners, associations and address brokers, and from public sources such as public registers or the internet (websites, social media, etc.).</Text>
					<Text :class="$style.section_paragraph">We generally keep master data for <u>2 years</u> from the last exchange between us or from the end of the contract. This period may be longer if required for evidentiary purposes, to comply with legal or contractual requirements. For contacts used only for marketing and advertising, the retention period is usually much shorter, usually no more than <u>2 years</u> from the last contact.</Text>
					<Text :class="$style.section_paragraph">Master data includes data such as name, address, e-mail address, telephone number and other contact details, gender, date of birth, nationality, data about related persons, websites, social media profiles, photos and videos, copies of ID cards; moreover, details of your relationship with us (customer, supplier, visitor, service recipient, etc.), details of your status, allocations, classifications and mailing lists, details of our interactions with you (if applicable, a history thereof with corresponding entries), reports (for example from the media), or official documents (for example excerpts from the commercial register, permits, etc.) that concern you. As payment information, we collect, for example, your bank details, account number and credit card data. Declarations of consent and opt-out information are also part of the master data, as well as information about third parties, for example contact persons, recipients of services, advertising recipients or representatives.</Text>
					<Text :class="$style.section_paragraph">Master data is not collected comprehensively for all contacts. The data collected in an individual case depends mostly on the purpose of the processing activity.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">3.4 Contract Data</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">This means personal data that is collected in relation to the conclusion or performance of a contract, for example information about the contracts and the services provided or to be provided, as well as personal data from the period leading up to the conclusion of a contract, information required or used for performing the services, and information about feedback (for example complaints, feedback about satisfaction, etc.). We generally collect this data from you, from contractual partners and from third parties involved in the performance of the contract, but also from third-party sources (for example credit information providers) and from public sources. We generally keep this data for <u>2 years</u> from the last contract activity or from the end of the contract. This period may be longer where necessary for evidentiary purposes, to comply with legal or contractual requirements.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">3.5 Behavioural and preference data</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">Depending on our relationship with you, we try to get to know you better and to tailor our services and offers to you. For this purpose, we collect and process data about your behavior and preferences. We do so by evaluating information about your behavior in our domain, and we may also supplement this information with third-party information, including from public sources. Based on this data, we can for example determine the likelihood that you will use certain services or behave in a certain way. The data processed for this purpose is already known to us (for example where and when you use our services), or we collect it by recording your behavior (for example how you navigate our Website).</Text>
					<Text :class="$style.section_paragraph">Behavioral data is information about certain actions, such as your response to electronic communications (for example if and when you have opened an e-mail) or your location, as well as your interaction with our social media pages and your participation in sweepstakes, competitions and similar events. Preference data tells us what your needs are, which products or services might be of interest to you or when and how you will likely respond to messages from us.</Text>
					<Text :class="$style.section_paragraph">Behavioral and preference data may be analyzed on a personally identifiable basis (for example to show you personalized advertising), but also on a non-identifiable basis (for example for market research or product development). Behavioral and preference data may also be combined with other data (for example, motion data may be used for contact tracing as part of a health protection concept).</Text>
					<Text :class="$style.section_paragraph">We anonymize or delete this data when it is no longer relevant for the purposes pursued, which may be <u>2 years</u> for service preferences. This period may be longer where necessary for evidentiary purposes, to comply with legal or contractual requirements, or for technical reasons. We describe how tracking works on our Website in Section 4.</Text>
				</Flex>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">4. Online tracking and Cookies</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">When using our Website (including newsletters and other digital offers), data is collected that is stored in logs (in particular technical data). We may also use cookies and similar technologies (e.g. pixel tags or fingerprints) to recognise website visitors, evaluate their behaviour and identify preferences. A cookie is a small file that is transmitted between the server and your system and enables a specific device or browser to be recognised.<br>You can set your browser so that it automatically rejects, accepts or deletes cookies. You can also deactivate or delete cookies in individual cases. You can find out how to manage cookies in your browser in your browser's help menu.</Text>
				<Text :class="$style.section_paragraph">Neither the technical data we collect nor cookies generally contain any personal data. However, personal data that we or third-party providers commissioned by us store about you (e.g. if you have a user account with us or these providers) may be linked to the technical data or to the information stored in and obtained from cookies and thus possibly to your person.</Text>
				<Text :class="$style.section_paragraph">We might also use social media plug-ins, which are small pieces of software that establish a connection between your visit to our Website and a third-party provider. The social media plug-in informs the third-party provider that you have visited our Website and may send the third-party provider cookies that it has previously placed on your web browser. For more information on how these third-party providers use your personal data collected via their social media plug-ins, please refer to their respective privacy policies.</Text>
				<Text :class="$style.section_paragraph">We also use our own tools and services from third-party providers (which may themselves use cookies) on our Website, in particular to improve the functionality or content of our Website (e.g. integration of videos or maps), to compile statistics and to place adverts.</Text>
				<Text :class="$style.section_paragraph">We may currently use the services of the following service providers and advertising partners in particular, whereby their contact details and further information on the individual data processing can be found in the respective privacy policy:</Text>
				
				<ul>
					<li>
						<Flex direction="column">
							<Text weight="600" :class="$style.section_paragraph">Google Analytics</Text>
							<Text :class="$style.section_paragraph">Provider: Google Ireland Ltd.</Text>
							<Text :class="$style.section_paragraph">Privacy policy: <a href="https://support.google.com/analytics/answer/6004245" target="_blank" :class="$style.link">https://support.google.com/analytics/answer/6004245</a></Text>
						</Flex>
					</li>
					<li>
						<Flex direction="column">
							<Text weight="600" :class="$style.section_paragraph">Google Fonts</Text>
							<Text :class="$style.section_paragraph">Provider: Google Ireland Ltd.</Text>
							<Text :class="$style.section_paragraph">Privacy policy: <a href="https://developers.google.com/fonts/faq/privacy" target="_blank" :class="$style.link">https://developers.google.com/fonts/faq/privacy</a></Text>
						</Flex>
					</li>
					<li>
						<Flex direction="column">
							<Text weight="600" :class="$style.section_paragraph">Cloudflare</Text>
							<Text :class="$style.section_paragraph">Provider: Cloudflare, Inc.</Text>
							<Text :class="$style.section_paragraph">Privacy policy: <a href="https://www.cloudflare.com/privacypolicy" target="_blank" :class="$style.link">https://www.cloudflare.com/privacypolicy/</a></Text>
						</Flex>
					</li>
					<li>
						<Flex direction="column">
							<Text weight="600" :class="$style.section_paragraph">Amplitude</Text>
							<Text :class="$style.section_paragraph">Provider: Amplitude, Inc.</Text>
							<Text :class="$style.section_paragraph">Privacy policy: <a href="https://amplitude.com/privacy" target="_blank" :class="$style.link">https://amplitude.com/privacy</a></Text>
						</Flex>
					</li>
					<li>
						<Flex direction="column">
							<Text weight="600" :class="$style.section_paragraph">Keplr</Text>
							<Text :class="$style.section_paragraph">Provider: Chainapsis, Inc.</Text>
							<Text :class="$style.section_paragraph">Privacy policy: <a href="https://wallet.keplr.app/privacy-policy.html" target="_blank" :class="$style.link">https://wallet.keplr.app/privacy-policy.html</a></Text>
						</Flex>
					</li>
					<li>
						<Flex direction="column">
							<Text weight="600" :class="$style.section_paragraph">Leap</Text>
							<Text :class="$style.section_paragraph">Provider: Hyphen Labs Ltd.</Text>
							<Text :class="$style.section_paragraph">Privacy policy: <a href="https://www.leapwallet.io/legal/privacy" target="_blank" :class="$style.link">https://www.leapwallet.io/legal/privacy</a></Text>
						</Flex>
					</li>
				</ul>

				<Text :class="$style.section_paragraph">Some of the third-party providers we use may be located outside Switzerland. Information on data disclosure abroad can be found in the sections 6 and 7.</Text>
			</Flex>
		</Flex>
	
		<Flex :class="$style.section">
			<Text :class="$style.section_title">5. For what purposes do we process your data?</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">We process your data for the purposes explained below. These purposes and their objectives represent interests of us and potentially of third parties. You can find further information on the legal basis of our processing in Section 5.</Text>

				<ul>
					<li>We process your data for purposes related to communication with you, in particular in relation to responding to inquiries and the exercise of your rights (Section 10) and to enable us to contact you in case of queries. For this purpose, we use in particular communication data and master data, and registration data in relation to offers and services that you use. We keep this data to document our communication with you, for training purposes, for quality assurance and for follow-up inquiries.</li>
					<li>We process data for the conclusion, administration and performance of contractual relationships.</li>
					<li>We may also process your data for security and access control purposes.</li>
					<li>We process personal data to comply with laws, directives and recommendations from authorities and internal regulations.</li>
					<li>We also process data for the purposes of our risk management and as part of our corporate governance, including business organization and development.</li>
					<li>We may process your data for further purposes, for example as part of our internal processes and administration or for quality assurance purposes and trainings.</li>
				</ul>

			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">6. Legal basis for Processing</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">Where we ask for your consent for certain processing activities (for example for the processing of sensitive personal data, for marketing mailings, for personalized motion profiles and for advertising management and behavior analysis on the Website), we will inform you separately about the relevant processing purposes. You may withdraw your consent at any time with effect for the future by providing us written notice (by mail) or, unless otherwise noted or agreed, by sending an e-mail to us; see our contact details in Section 2. For withdrawing consent for online tracking, see Section 4. Where you have a user account, you may also withdraw consent or contact us also through the relevant website or other service, as applicable. Once we have received notification of withdrawal of consent, we will no longer process your information for the purpose(s) you consented to, unless we have another legal basis to do so. Withdrawal of consent does not, however, affect the lawfulness of the processing based on the consent prior to withdrawal.</Text>
				<Text :class="$style.section_paragraph">Where we do not ask for consent for processing, the processing of your personal data relies on the requirement of the processing for initiating or performing a contract with you (or the entity you represent) or on our or a third-party legitimate interest in the particular processing, in particular in pursuing the purposes and objectives set out in Section 6 and in implementing related measures. Our legitimate interests also include compliance with legal regulations, insofar as this is not already recognized as a legal basis by applicable data protection law (for example in the case of the GDPR, the laws in the EEA and in the case of the DPA, Swiss law). This also includes the marketing of our products and services, the interest in better understanding our markets and in managing and further developing our Company, including its operations, safely and efficiently.</Text>
				<Text :class="$style.section_paragraph">Where we receive sensitive personal data (for example health data, data about political opinions, religious or philosophical beliefs, and biometric data for identification purposes), we may process your data on other legal basis, for example, in the event of a dispute, as required in relation to a potential litigation or for the enforcement or defense of legal claims. In some cases, other legal basis may apply, which we will communicate to you separately as necessary.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">7. Other parties who have access to personal data we collect</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">In relation to our contracts, the Website, our services, our legal obligations or otherwise with protecting our legitimate interests and the other purposes set out in Section 5, we may disclose your personal data to third parties, in particular to the following categories of recipients:</Text>

				<ul>
					<li><b>Service Providers:</b> We work with service providers in Switzerland and abroad who process your data on our behalf or as joint controllers with us or who receive data about you from us as separate controllers (for example IT providers, shipping companies, advertising service providers, login service providers, security companies, banks, insurance companies, debt collection companies, credit information agencies, or address verification providers). Our Website service provider is Cloudflare, Inc., 101 Townsend St., San Francisco, California 94107. With the exception of the named provider of our Website, we do not make your personal data available to third parties unless you have expressly consented to it, if we are legally obligated to, or if this is necessary to enforce our rights concerning a contractual relationship.<br>In each case, we disclose to these providers the data they require for their services, which may also concern you. In addition, we enter into contract with these service providers that include provisions to protect personal data, where such protection does not follow from the law.</li>
					<li><b>Contractual partners including customers:</b> This refers to customers (for example service recipients) and our other contractual partners as this data disclosure results from these contracts. For example, they may receive registration data in relation to issued and redeemed vouchers, invitations, etc. If you work for one of these contractual partners, we may also disclose data about you to that partner in this regard. These recipients also include contractual partners with whom we may cooperate or and to whom we may therefore disclose data about you for analysis purposes. We require these partners to send you or display advertising based on your data only with your consent.</li>
					<li><b>Authorities:</b> We may disclose personal data to agencies, courts and other authorities in Switzerland and abroad if we are legally obliged or entitled to make such disclosures or if it appears necessary to protect our interests. These authorities act as separate controllers.</li>
					<li><b>Other persons:</b> This means other cases where interactions with third parties follows from the purposes set out in Section 4, for example service recipients, the media and associations in which we participate or if you are included in one of our publications.</li>
				</ul>

				<Text :class="$style.section_paragraph">All these categories of recipients may involve third parties, so that your data may also be disclosed to them. We can restrict the processing by certain third parties (for example IT providers), but not by others (for example authorities, banks, etc.).</Text>
				<Text :class="$style.section_paragraph">We reserve the right to make such disclosures even of secret data (unless we have expressly agreed with you that we will not disclose such data to certain third parties, except if we are required to do so by law). Notwithstanding the foregoing, your data will continue to be subject to adequate data protection in Switzerland and the rest of Europe, even after disclosure. For disclosure to other countries, the provisions of Section 10 apply. If you do not wish certain data to be disclosed, please let us know so that we can review if and to what extent we can accommodate your concern (Section 2).</Text>
				<Text :class="$style.section_paragraph">In addition, we enable certain third parties to collect personal data from you on our Website and at events organized by us (for example press photographers, providers of tools on our Website, etc.). Where we have no control over these data collections, these third parties are sole controllers. If you have concerns or wish to exercise your data protection rights, please contact these third parties directly.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">8. International transfer of personal data</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">As referred in Section 6, we disclose data to other parties. These are not all located in Switzerland.</Text>
				<Text :class="$style.section_paragraph">If a recipient is located in a country without adequate statutory data protection, we require the recipient to undertake to comply with data protection (for this purpose, we use the revised European Commission’s standard contractual clauses, which can be accessed here: <a href="https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj" target="_blank" :class="$style.link">https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj</a>, unless the recipient is subject to a legally accepted set of rules to ensure data protection and unless we cannot rely on an exception. An exception may apply for example in case of legal proceedings abroad, but also in cases of overriding public interest or if the performance of a contract requires disclosure, if you have consented or if data has been made available generally by you and you have not objected against the processing.</Text>
				<Text :class="$style.section_paragraph">Please note that data exchanged via the internet is often routed through third countries. Your data may therefore be sent abroad even if the sender and recipient are in the same country.</Text>
			</Flex>
		</Flex>
		
		<Flex :class="$style.section">
			<Text :class="$style.section_title">9. How long do we process your data?</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">We process your data for as long as our processing purposes, the legal retention periods and our legitimate interests in documentation and keeping evidence require it or storage is a technical requirement. You will find further information on the respective storage and processing periods for the individual data categories in Section 3, and Section 4. If there are no contrary legal or contractual obligations, we will delete or anonymize your data once the storage or processing period has expired as part of our usual processes.</Text>
			</Flex>
		</Flex>
		
		<Flex :class="$style.section">
			<Text :class="$style.section_title">10. Data security</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">We use appropriate technical and organizational security measures to protect your stored personal data against manipulation, partial or complete loss, and unauthorized access by third parties. Our security measures are continuously being improved in line with technical developments.</Text>
				<Text :class="$style.section_paragraph">Please note that any data transmission on the Internet (e.g. communication by e-mail) is generally not secure and we accept no liability for data transmitted to us via the Internet. Unfortunately, absolute protection is not technically possible.</Text>
				<Text :class="$style.section_paragraph">This information does not apply to the websites of third parties and the corresponding links given on our Website. Company assumes no responsibility and liability for these.</Text>
			</Flex>
		</Flex>
		
		<Flex :class="$style.section">
			<Text :class="$style.section_title">11. Your Rights regarding your personal data</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">You have the right to object to the processing of your personal data in some circumstances, in particular for direct marketing purposes, for profiling carried out for direct marketing purposes and for other legitimate interests in processing.</Text>
				<Text :class="$style.section_paragraph">You have the following rights in relation to our data processing, depending on the applicable data protection law:</Text>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">11.1 Right to request information</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">You have the right to obtain information from us as to whether or not personal data concerning you is being processed and what personal data we process from you. If you wish to avail yourself of this right of confirmation, you may, at any time, contact the responsible person as stated in Section 1 of this Privacy Policy.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">11.2 Right to access</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">You have the right to obtain from us free information about your personal data stored at any time and a copy of this information. Furthermore, you will have access to the following information:</Text>

					<ul>
						<li>the purposes of the processing;</li>
						<li>the categories of personal data concerned;</li>
						<li>the recipients or categories of recipients to whom the personal data have been or will be disclosed, in particular recipients in third countries or international organizations;</li>
						<li>where possible, the envisaged period for which the personal data will be stored, or, if not possible, the criteria used to determine that period;</li>
						<li>the existence of the right to request from the Company rectification or erasure of personal data, or restriction of processing of personal data concerning you, or to object to such processing;</li>
						<li>the existence of the right to lodge a complaint with a supervisory authority;</li>
						<li>where the personal data are not collected directly from you, any available information as to their source; and</li>
						<li>the existence of automated decision-making, including profiling, referred to in Article 22(1) and (4) of the GDPR and, at least in those cases, meaningful information about the logic involved, as well as the significance and envisaged consequences of such processing for you.</li>
					</ul>

					<Text :class="$style.section_paragraph">If you wish to avail yourself of this right of access, you may at any time contact the responsible person as stated in Section 1 of this Privacy Policy.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">11.3 Right to rectification</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">You have the right to obtain from us, without undue delay, the rectification of inaccurate personal data concerning you. Taking into account the purposes of the processing, you shall have the right to have incomplete personal data completed, including by means of providing a supplementary statement. If you wish to exercise this right to rectification, you may, at any time, contact the responsible person as stated in Section 1 of this Privacy Policy.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">11.4 Right to erasure (right to be forgotten)</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">You have the right to obtain from us the erasure of personal data concerning you as soon as possible, and we shall have the obligation to erase personal data without undue delay where one of the following grounds applies:</Text>

					<ul>
						<li>The personal data is no longer necessary in relation to the purposes for which they were collected or otherwise processed;</li>
						<li>You withdraw consent to which the processing is based according to point (a) of Article 6(1) of the GDPR, or point (a) of Article 9(2) of the GDPR, and where there is no other legal ground for the processing;</li>
						<li>The data subject objects to the processing pursuant to Article 21(1) of the GDPR and there are no overriding legitimate grounds for the processing, or the data subject objects to the processing pursuant to Article 21(2) of the GDPR;</li>
						<li>The personal data has been unlawfully processed;</li>
						<li>The personal data must be erased for compliance with a legal obligation in accordance with the applicable law to which the Company is subject; and/or</li>
						<li>The personal data has been collected in relation to the offer of information society services referred to in Article 8(1) of the GDPR.</li>
					</ul>

					<Text :class="$style.section_paragraph">If any one of the aforementioned reasons applies, and you wish to request the erasure of personal data stored by the Company, you may at any time contact the responsible person as stated in Section 1 of this Privacy Policy. The responsible person at the Company shall promptly ensure that the erasure request is complied with as soon as possible.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">11.5 Right to receive personal data in a commonly used electronic format</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">You have the right to request that we provide certain personal data in a commonly used electronic format or transfer it to another controller.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">11.6 Right to restriction of processing</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">You have the right to obtain from the Company restriction of processing where one of the following applies:</Text>

					<ul>
						<li>the accuracy of the personal data is contested by you, for a period enabling the Company to verify the accuracy of the personal data;</li>
						<li>the processing is unlawful and you oppose the erasure of the personal data and requests instead the restriction of their use instead;</li>
						<li>the Company no longer needs the personal data for the purposes of the processing, but they are required by you for the establishment, exercise or defense of legal claims; and/or</li>
						<li>the data subject has objected to processing pursuant to Article 21(1) of the GDPR pending the verification whether the legitimate grounds of the Company override those of the data subject.</li>
					</ul>

					<Text :class="$style.section_paragraph">If any one of the aforementioned conditions is met, and you wish to request the restriction of the processing of personal data stored by the Company, you may at any time contact the Company's responsible person. The responsible person will arrange the restriction of the processing.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">11.7 Right to object</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">You have the right to object, on grounds relating to your particular situation, at any time, to the processing of personal data concerning you, which is based on point (e) or (f) of Article 6(1) of the GDPR. This also applies to profiling based on these provisions.</Text>
					<Text :class="$style.section_paragraph">The Company shall no longer process the personal data in the event of the objection, unless the Company can demonstrate reasonable grounds for the processing, which override the interests, rights and freedoms of you, or for the establishment, exercise or defense of legal claims. In order to exercise the right to object, you may directly contact the responsible person.</Text>
				</Flex>
			</Flex>

			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">11.8 Right to withdraw data protection consent</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<Text :class="$style.section_paragraph">You have the right to withdraw your consent to processing of your personal data at any time where our processing is based on your consent. If you wish to exercise the right to withdraw the consent, you may at any time directly contact the responsible person as stated in Section 1.</Text>
				</Flex>
			</Flex>
			<Flex :class="[$style.section, $style.sub_section, $style.section_content]">
				<Text :class="$style.section_title">11.9 Right to receive further information</Text>

				<Flex :class="[$style.section, $style.section_content]">
					<ul>
						<li>The right to receive, upon request, further information that is helpful for the exercise of these rights;</li>
						<li>The right to express your point of view in case of automated individual decisions (Section 6) and to request that the decision be reviewed by a human.</li>
					</ul>

					<Text :class="$style.section_paragraph">If you wish to exercise the above-mentioned rights in relation to us, please contact us in writing, at our premises or, unless otherwise specified or agreed, by e-mail; you will find our contact details in Section 2. In order for us to be able to prevent misuse, we need to identify you (for example by means of a copy of your ID card, unless identification is not possible otherwise).</Text>
					<Text :class="$style.section_paragraph">You also have these rights in relation to other parties that cooperate with us as separate controllers – please contact them directly if you wish to exercise your rights in relation to their processing. You will find information on our key partners and service providers in Section 6.</Text>
					<Text :class="$style.section_paragraph">Please note that conditions, exceptions or restrictions apply to these rights under applicable data protection law (for example to protect third parties or trade secrets). We will inform you accordingly where applicable.</Text>
					<Text :class="$style.section_paragraph">If you do not agree with the way we handle your rights or with our data protection practices, please let us know. If you are located in the EEA, the United Kingdom or in Switzerland, you also have the right to lodge a complaint with the competent data protection supervisory authority in your country.</Text>
				</Flex>
			</Flex>
		</Flex>
		
		<Flex :class="$style.section">
			<Text :class="$style.section_title">12. Minors</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">The Company does not knowingly collect or use any personal data from minors. A minor may be able to willingly share personal information with others, depending on the products and/or media channels used. If a minor provides us with their information without the consent of their parent or guardian, we will ask the parent or guardian to contact us for the purpose of deleting that information.</Text>
			</Flex>
		</Flex>
		
		<Flex :class="$style.section">
			<Text :class="$style.section_title">13. Updates to our Privacy Policy</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">The Company may update this Privacy Policy from time to time and inform you on the Website that the policy has been amended. The current version of the Privacy Policy, as published on our Website, is applicable. With each update to our policies, we will note which Sections have been updated.</Text>
			</Flex>
		</Flex>
		
		<Flex :class="$style.section">
			<Text :class="$style.section_title">14. More information about privacy regulations</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">For more information on applicable privacy regulations, you may refer to:</Text>

				<ul>
					<li>EU General Data Protection Regulation: <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=uriserv:OJ.L_.2016.119.01.0001.01.ENG" target="_blank" :class="$style.link">https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=uriserv:OJ.L_.2016.119.01.0001.01.ENG</a></li>
					<li>Swiss Federal Act on Data Protection: <a href="https://www.admin.ch/opc/en/classified-compilation/19920153/index.html" target="_blank" :class="$style.link">https://www.admin.ch/opc/en/classified-compilation/19920153/index.html</a></li>
					<li>Swiss Ordinance to the Federal Act on Data Protection: <a href="https://www.admin.ch/opc/en/classified-compilation/19930159/index.html" target="_blank" :class="$style.link">https://www.admin.ch/opc/en/classified-compilation/19930159/index.html</a></li>
				</ul>

				<Text :class="$style.section_paragraph">Please do not hesitate to contact us if you have any questions regarding this Privacy Policy by contacting us at <a href="mailto:celenium@baking-bad.org" :class="$style.link">celenium@baking-bad.org</a>.</Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	padding: 20px 24px 32px 24px;
}

.section {
	flex-direction: column;
	gap: 12px;
}

.wrapper > .section {
	margin-top: 8px;
}

.section_title {
	color: var(--txt-primary);
	font-size: 14px;
	font-weight: 600;
}

.section_content {
	color: var(--txt-secondary);
	font-size: 14px;
}

.section_paragraph {
	line-height: 1.2;
}

.sub_section {
	padding-left: 12px;
}

.section > .sub_section {
	margin-top: 4px;
}

li:not(li:last-child) {
	margin-bottom: 4px;
}

.link {
	color: var(--txt-secondary);

	transition: all 0.3s ease;

	&:hover {
		color: var(--txt-primary);
		text-decoration: underline;
	}
}
</style>
