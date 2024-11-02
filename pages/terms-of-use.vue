<script setup>
useHead({
	title: "Terms of Use",
})
</script>

<template>
	<Flex direction="column" align="start" gap="24" :class="$style.wrapper" wide>
		<Flex direction="column" gap="6" wide>
			<Text color="primary" size="18" :style="{fontWeight: 800}">Terms of Use</Text>
			<Text color="tertiary" size="12">Last Updated: November 1th, 2024</Text>
		</Flex>

		<Flex :class="$style.section">
			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">Welcome to Celenium, provided by PK Labs AG, Gartenstrasse 6, 6300 Zug, Switzerland, (“Company”, “we”, “us”, or “our”). When we refer to “user”, "you" or "your" we mean you, the person accessing or using our website. The following Terms of Use (“<b>Terms</b>”), together with any documents which are expressly incorporated by reference govern your access to and use of <a href="https://celenium.io" :class="$style.link">https://celenium.io</a> (hereinafter the "<b>Website</b>”).</Text>
				<Text :class="$style.section_paragraph">By using the Website and/or clicking “Accept,” or using and/or accessing any of our interfaces, applications, products and/or other services, you agree to these Terms and the general disclaimer on our website and to the privacy policy under this <a href="https://celenium.io/privacy-policy" :class="$style.link">https://celenium.io/privacy-policy</a>. If you are not in agreement with these Terms, you may not access our Website.</Text>
				<Text :class="$style.section_paragraph">We reserve the right, at our sole discretion, to change, modify, add or remove portions of these Terms at any time. Your continued use of the Website following the posting of revised Terms means that you accept and agree to the changes. It is your responsibility to check these Terms periodically for changes.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">1. Services</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">Through the Website, we offer various services (the “<b>Services</b>”), including the following:</Text>

				<ul>
					<li>Celenium API: access to an API, which allows clients to retrieve all indexed data from the Celestia network.</li>
				</ul>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">2. User account</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">In order to access certain services, users may be required to create an account. By registering, you confirm that you meet the following eligibility requirements and that the information you provide is accurate, complete, and up-to-date.</Text>
				<Text :class="$style.section_paragraph">You must be at least 18 years old to register and use the Services. By registering, you represent and warrant that you have the legal capacity to enter into these Terms and that you are not prohibited from using the Services by any applicable law or regulation.</Text>
				<Text :class="$style.section_paragraph">You are responsible for maintaining the confidentiality and security of your account information, including your login credentials. You agree to: (i) not share your account information with any third party, (ii) notify us immediately if you suspect any unauthorized access to or use of your account and (iii) ensure that you log out from your account at the end of each session if you access the Services from a shared or public device.</Text>
				<Text :class="$style.section_paragraph">We will not be liable for any loss or damage arising from your failure to comply with these security obligations. You are solely responsible for all activities that occur under your account, whether or not authorized by you.</Text>
				<Text :class="$style.section_paragraph">You agree to use your account solely for your own purposes and not to impersonate any other person or entity, or falsely state or otherwise misrepresent your affiliation with any person or entity.</Text>
				<Text :class="$style.section_paragraph">You must promptly update your account information to keep it accurate, complete, and current. We reserve the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, false, or misleading.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">3. Fees</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">Some of the Services may be subject to fees (the “<b>Fees</b>”). Payments of the Fees are processed through a third-party payment service provider (i.e. Stripe).</Text>
				<Text :class="$style.section_paragraph">The Fees and/or subscription terms are displayed on the Website.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">4. Content of website</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">The Content is provided for general information purposes only. We do not warrant the accuracy, completeness or usefulness of the Content. Any reliance you place on such information is strictly at your own risk. Nothing in the Content should be used or relied upon as legal, financial, tax or other advice, or as an instruction or solicitation of action by any person.</Text>
				<Text :class="$style.section_paragraph">The Website may contain links to websites and content that is controlled or operated by third parties (“<b>Third Party Links</b>”). The Company is providing these Third Party Links to you only for convenience and the inclusion of any Third Party Links on the Website does not imply any endorsement by the Company of the Third Party Links and/or their operators. The Company is not responsible for any and all content contained in or associated with the Third Party Links.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">5. Prohibited activities</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">You must not disrupt, compromise, or otherwise damage data or property owned by other parties or do anything to disrupt any of our services, whether directly or indirectly. This includes attacking any devices or accounts other than your own (or those for which you have explicit, written permission from their owners), using phishing or social engineering techniques and/or using bots. Except as expressly permitted under this Agreement, you shall not, and shall not permit any third party to: (i) modify or create any derivative work of any part of our services, (ii) use our Website for commercial time-sharing or service bureau use, or (iii) reverse engineer, decompile, disassemble or otherwise attempt to discover the source code, object code or underlying structure, ideas, know-how or algorithms relevant to our Website. Immediately notify us as set forth in these Terms before any of the following occur:</Text>

				<ul>
					<li>You access any accounts or data other than your own (or those for which you have explicit, written permission from their owners)</li>
					<li>You disrupt any of the Services; or</li>
					<li>You access a non-customer-facing Company system.</li>
				</ul>

				<Text :class="$style.section_paragraph">You shall not nor cause or encourage others for any illegal, harmful, fraudulent, infringing, or objectionable activities, including but not limited to the following list of prohibited activities:</Text>

				<ul>
					<li>Any act which might bring the Company, and its affiliates into public disrepute;</li>
					<li>Actions that would infringe any applicable laws and regulations, including Anti Money Laundering / Countering of the Financing of Terrorism laws and regulations;</li>
					<li>Information and/or content in any submission or application that is illegal or criminal, false, fraudulent, deceptive, misleading, defamatory, threatening, libellous, slanderous, disparaging, unlawfully harassing, profane, obscene, pornographic, hateful, indecent, inappropriate or injurious to any individual or any third party;</li>
					<li>Disrupting, manipulating, or degrading the Services;</li>
					<li>Phishing, spamming, or pharming;</li>
					<li>Unsolicited contacting of users or other abusive behaviour;</li>
					<li>Illegal advertising or fraudulent marketing activities;</li>
					<li>Infringing or misappropriating the rights of others;</li>
					<li>Introduce any viruses, trojan horses, worms, logic bombs or other material which is malicious or technologically harmful;</li>
					<li>Attempt to gain unauthorized access to, interfere with, damage or disrupt any parts of the Website;</li>
					<li>Use any device, software or routine that interferes with the proper working of the Website;</li>
					<li>Creating a security risk for the Company.</li>
				</ul>
				
				<Text :class="$style.section_paragraph">In the event that the Company discovers or suspects that you have engaged in unfair, conflicting, excessive or abusive usage or conduct, the Company reserves the right to ban you and take such actions as may be necessary, to the fullest extent possible under law, to protect the Company from losses, damages, harm or degradation of any form and manner.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">6. Taxes</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">You are responsible for the payment of all taxes and/or levies applicable to you in connection with any of the Services.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">7. Compliance with laws</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">You agree to comply with all laws, rules, regulations, and any generally accepted practices or guidelines in the relevant jurisdictions applicable to you (including, without limitation, any laws regarding the export of data or software to and from the European Union / Switzerland or other relevant countries and all applicable privacy and data collection laws and regulations). To the extent required by law, you are solely responsible for obtaining or filing any approval, clearance, registration, permit, or other regulatory authorization applicable to you and shall comply with the requirements of such authorization.</Text>
				<Text :class="$style.section_paragraph">The provider of the Website is based in Switzerland. We make no claims that the Website or any of its content is accessible or appropriate outside of Switzerland. Access to the Website may not be legal by certain persons or in certain countries. If you access the Website from outside Switzerland, you do so on your own initiative and are responsible for compliance with local laws.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">8. Sanctions and anti-money laundering</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">You represent, warrant and covenant to us that you have not been, are not and will not be:</Text>

				<ul :class="$style.letter_list">
					<li>accessing the Website if the laws of your country of residence and/or citizenship prohibit you from doing so in accordance with these Terms;</li>
					<li>a citizen, or resident of, or located in, or a legal entity or similar formed or incorporated within or subject to the laws of any jurisdiction in which the use of the Services is prohibited, restricted or unauthorised in any form or manner whether in full or in part under the laws, regulatory requirements or rules in such jurisdiction;</li>
					<li>a Sanctioned Entity and/or a Sanctioned Person (as defined below) and/or an entity or person acting on behalf of a Sanctioned Entity or Sanctioned Person;</li>
					<li>are not participating from, or are a national or resident of, any of the countries embargoed or restricted by, including without limitation, the Swiss State Secretariat for Economic Affairs (SECO) (“Prohibited Jurisdictions”); and</li>
					<li>transacting with any Sanctioned Person or Sanctioned Entity or any person in any Prohibited Jurisdiction.</li>
				</ul>

				<Text :class="$style.section_paragraph">You further agree that you shall at all times, in all your activities in connection with the Website and the Services and the Company, comply with all regulations, laws and legislation, including, without limitation, Anti-Money Laundering Laws and Sanctions, applicable to you.</Text>
				<Text :class="$style.section_paragraph">For the purposes of this clause, the following words shall have the following meanings:</Text>
				<Text :class="$style.section_paragraph">“Anti-Money Laundering Laws” means, any Swiss anti-money laundering act, laws or regulation, in each case, as amended from time to time and all other similar laws, rules, and regulations of any jurisdiction applicable to you or us.</Text>
				<Text :class="$style.section_paragraph">“Sanctioned Entity” means (i) a country or a government of a country, (ii) an agency of the government of a country, (iii) an organization directly or indirectly controlled by a country or its government, or (iv) a person resident in or determined to be resident in a country, in each case, that is subject to a country Sanctions program administered and enforced by Switzerland (SECO), any governmental body of any other relevant jurisdiction.</Text>
				<Text :class="$style.section_paragraph">“Sanctioned Person” means (i) any person listed in any sanctions-related list of designated Persons maintained by any governmental body or (ii) a person named on the list of Specially Designated Nationals maintained by Swiss SECO’s Overall List of Sanctioned Individuals, or any governmental body of any other relevant jurisdiction, in each case as amended, supplemented or substituted from time to time.</Text>
				<Text :class="$style.section_paragraph">“Sanctions” means economic or financial sanctions or trade embargoes imposed, administered or enforced from time to time by Switzerland and any governmental body of any other relevant jurisdiction.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">9. Intellectual property rights</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">By using our Website you do not gain any rights thereto. All right, title, and interest in and to our Website, including all modifications, improvements, and enhancements made thereto, and all proprietary rights therein, as well as any products, materials and content prepared by you shall be and remain the Company’s sole and exclusive property. There are no implied licenses under these Terms, and any rights not expressly granted to you hereunder are reserved by the Company.</Text>
				<Text :class="$style.section_paragraph">If you want to use, reproduce, modify, distribute, or store any copyrights and trademarks of the Company for any purpose, applicants need prior written permission from the Company.</Text>
				<Text :class="$style.section_paragraph">The name of the Company, its logo, and all related names, logos, product and service names, designs and slogans are trademarks of the Company or its affiliates or licensors. You must not use such marks without the prior written permission of the Company. We are the owner or licensee of all intellectual property rights in the Website and its entire content. This includes in particular but without limitation, page headers, texts, graphics, logos, images, digital downloads and the selection and arrangement of the same. You agree not to take any action(s) inconsistent with such ownership interests.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">10. Warranty disclaimer</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">Your use of the Website, its content and any services or items obtained through the Website is AT YOUR OWN RISK. The Website, its content and any services or items obtained through the Website are provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied. Neither the Company nor any person associated with the Company makes any warranty or representation with respect to the completeness, security, reliability, quality, accuracy or availability of the Website. Without limiting the foregoing, neither the Company nor anyone associated with the Company represents or warrants that the Website, its content or any services or items obtained through the Website will be accurate, reliable, error-free or uninterrupted, that defects will be corrected, that our site or the server that makes it available are free of viruses or other harmful components or that the Website or any services or items obtained through the Website will otherwise meet your needs or expectations.</Text>
				<Text :class="$style.section_paragraph">To the extent permitted by applicable law, the Company hereby disclaims any and all warranties of any kind, whether express or implied, statutory or otherwise, including but not limited to any warranties of merchantability, non-infringement and fitness for particular purpose.</Text>
				<Text :class="$style.section_paragraph">You understand that we cannot and do not guarantee or warrant that files available for downloading from the internet or the Website will be free of viruses or other destructive code. You are responsible for implementing sufficient procedures and checkpoints to satisfy your particular requirements for anti-virus protection and accuracy of data input and output, and for maintaining a means external to our site for any reconstruction of any lost data.</Text>
				<Text :class="$style.section_paragraph">We will not be liable for any loss or damage caused by a distributed denial-of-service attack, viruses or other technologically harmful material that may infect your computer equipment, computer programs, data or other proprietary material due to your use of the Website or any services or items obtained through the Website or to your downloading of any material posted on it, or on any website linked to it.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">11. Limitation of liability</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE OR OUR SUPPLIERS, EMPLOYEES, ADVISORS, CORPORATE BODIES, OR LICENSORS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, OR FOR LOSS OF USE, LOST PROFITS, OR LOSS OF DATA ARISING OUT OF OR RELATED TO THESE TERMS OR THE WEBSITE, HOWEVER CAUSED AND REGARDLESS OF THE FORM OF ACTION, WHETHER IN CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE, EVEN IF WE OR OUR SUPPLIERS, EMPLOYEES, ADVISORS, CORPORATE BODIES, OR LICENSORS HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL THE CUMULATIVE LIABILITY OF US, OUR SUPPLIERS, EMPLOYEES, ADVISORS, CORPORATE BODIES, AND LICENSORS FOR ANY PROVEN CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE WEBSITE EXCEED THE FEES YOU HAVE PAID TO US WITHIN THE 12 MONTHS PRIOR TO THE EVENT CAUSING SUCH DAMAGES. Some jurisdictions do not allow limitations of liability, so the foregoing limitation may not apply to you.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">12. Indemnification</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">You agree to indemnify and hold us and our affiliates, and their officers, directors, employees, agents, suppliers, and licensors harmless from and against any and all claims, damages, losses, liabilities, costs and expenses (including, but not limited to, court costs and reasonable attorneys’ fees) arising out of or in connection with any breach of these Terms by you or your participation in the Website and/or the Services.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">13. Termination</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph"><u>Termination by You</u></Text>
				<Text :class="$style.section_paragraph">You may terminate your account and subscription at any time by providing us with 30 days' prior notice. This can be done by following the instructions provided on the website or by contacting our support team at <a href="mailto:celenium@pklabs.me" :class="$style.link">celenium@pklabs.me</a>. Upon termination, you will lose access to all Services provided through the Website, and any data associated with your account may be deleted.</Text>
				<Text :class="$style.section_paragraph"><u>Termination by Us</u></Text>
				<Text :class="$style.section_paragraph">We reserve the right to terminate or suspend your account and access to the Services, with or without notice, for any reason, including but not limited to, if you violate these Terms, engage in fraudulent or illegal activities, or if we cease to provide the Services. In the event of a termination initiated by us, we will provide you with 30 days' prior notice, except in cases of violations of these Terms, fraudulent or illegal activities, or other urgent circumstances.</Text>
				<Text :class="$style.section_paragraph"><u>Effects of Termination</u></Text>
				<Text :class="$style.section_paragraph">Upon termination of your account, all rights and licenses granted to you under these Terms will immediately cease. You will not be entitled to any refunds of fees or other amounts paid prior to termination, except as expressly stated in these Terms.</Text>
				<Text :class="$style.section_paragraph"><u>Survival</u></Text>
				<Text :class="$style.section_paragraph">The provisions of these Terms that by their nature should survive termination will survive termination, including, but not limited to, provisions regarding ownership, indemnity, disclaimers, and limitations of liability.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">14. Assignment</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">You may not sell, assign or transfer any of your rights, duties or obligations under these Terms without our prior written consent. We reserve the right to assign or transfer these Terms or any of its rights, duties and obligations hereunder to any third party.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">15. Waiver and severability</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">No waiver by the Company of any term or condition set forth in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of the Company to assert a right or provision under these Terms shall not constitute a waiver of such right or provision.</Text>
				<Text :class="$style.section_paragraph">If any of these Terms is rendered void, illegal or unenforceable by any legislation to which it is subject, it shall be rendered void, illegal or unenforceable to that extent and no further and, for the avoidance of doubt, the rest of these Terms shall continue to be valid and in full force and effect and shall in no way be affected, impaired or invalidated, and the parties hereto shall use their commercially reasonable efforts to find and employ an alternative means to achieve the same or substantially the same result as that contemplated by such term, provision, covenant or restriction.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">16. Governing law and jurisdiction</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">These Terms and any dispute or claim arising out of or in any way relating to this Agreement or its formation (including non-contractual disputes or claims) shall be governed by and construed in accordance with substantive Swiss law under the exclusion of the conflicts of law rules. The application of the United Nations Convention for Contracts for the International Sales of Goods (“CISG”) is hereby expressly excluded. You and we irrevocably submit to the exclusive jurisdiction of the ordinary courts of the canton of Zug, Switzerland for the purpose of hearing and determining any dispute or claim (including non-contractual disputes or claims) arising out of these Terms or its subject matter or formation.</Text>
			</Flex>
		</Flex>

		<Flex :class="$style.section">
			<Text :class="$style.section_title">17. General provisions</Text>

			<Flex :class="[$style.section, $style.section_content]">
				<Text :class="$style.section_paragraph">These Terms do not create any relationship of association, partnership, joint venture or agency between us and you. Neither we nor you will have any right or authority to assume, create or incur any liability or obligation of any kind against or in the name of the other party. You shall not, under any circumstances, represent that you are an agent of the Company and you shall take all reasonable precautions to avoid any perception that such relationship exists. These Terms set forth the entire agreement and understanding between us and you with respect to the subject matter in these Terms. These Terms merge all previous discussions and negotiations between us and you and supersede them.</Text>
				<Text :class="$style.section_paragraph">A person who is not a party to these Terms shall not have any rights whatsoever under these Terms or to enforce these Terms.</Text>
				<Text :class="$style.section_paragraph">For support, contact us at <a href="mailto:celenium@pklabs.me" :class="$style.link">celenium@pklabs.me</a>.</Text>
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

@counter-style lower-alpha {
	system: fixed;
	symbols: (a) (b) (c) (d) (e);
	suffix: " ";
}

.letter_list {
	list-style: none;
	counter-reset: letter;
}

.letter_list li {
	counter-increment: letter;
	position: relative;
	padding-left: 26px;
}

.letter_list li::before {
	content: "(" counter(letter, lower-alpha) ")";
	position: absolute;
	left: 0;
}

.link {
	color: var(--txt-secondary);

	&:hover {
		color: var(--txt-primary);
		text-decoration: underline;
	}
}
</style>
