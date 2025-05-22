
package com.job_portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job_portal.DTO.CountJobByIndustry;
import com.job_portal.models.Industry;
import com.job_portal.repository.IndustryRepository;
import com.job_portal.service.IIndustryService;
import com.job_portal.service.WebSocketService;
import com.social.exceptions.AllExceptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IndustryController.class)
@WithMockUser(roles = {"USER"}) // Giả lập người dùng với vai trò USER
public class IndustryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IndustryRepository industryRepository;

    @MockBean
    private IIndustryService industryService;

    @MockBean
    private WebSocketService webSocketService;

    @Autowired
    private ObjectMapper objectMapper;

    private static final Integer INDUSTRY_ID = 1;
    private static final String INDUSTRY_NAME = "Công nghệ thông tin";
    private static final String SEARCH_QUERY = "Công nghệ";
    private static final long JOB_COUNT = 10L;

    private Industry industry;
    private CountJobByIndustry countJobByIndustry;

    @BeforeEach
    void setUp() {
        industry = new Industry();
        industry.setIndustryId(INDUSTRY_ID);
        industry.setIndustryName(INDUSTRY_NAME);

        countJobByIndustry = new CountJobByIndustry();
        countJobByIndustry.setIndustryName(INDUSTRY_NAME);
        countJobByIndustry.setJobCount(JOB_COUNT);
    }

    @Test
    void testGetAllIndustries_Success() throws Exception {
        // Arrange
        List<Industry> industries = Arrays.asList(industry);
        when(industryRepository.findAll()).thenReturn(industries);

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/industry/get-all"))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$[0].industryId").value(INDUSTRY_ID))
                .andExpect(jsonPath("$[0].industryName").value(INDUSTRY_NAME));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryRepository, times(1)).findAll();
    }

    @Test
    void testGetAllIndustries_EmptyList() throws Exception {
        // Arrange
        when(industryRepository.findAll()).thenReturn(Collections.emptyList());

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/industry/get-all"))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryRepository, times(1)).findAll();
    }

    @Test
    void testCreateIndustry_Success() throws Exception {
        // Arrange
        when(industryService.createIndustry(any(Industry.class))).thenReturn(true);

        // Act & Assert
        ResultActions result = mockMvc.perform(post("/industry/create-industry")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(industry)))
                .andDo(print());

        result.andExpect(status().isCreated())
                .andExpect(content().string("Create industry Success"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).createIndustry(any(Industry.class));
        verify(webSocketService, times(1)).sendUpdate(eq("/topic/industry-updates"), eq("ADD INDUSTRY"));
    }

    @Test
    void testCreateIndustry_Failure() throws Exception {
        // Arrange
        when(industryService.createIndustry(any(Industry.class))).thenReturn(false);

        // Act & Assert
        ResultActions result = mockMvc.perform(post("/industry/create-industry")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(industry)))
                .andDo(print());

        result.andExpect(status().isBadRequest())
                .andExpect(content().string("Create industry Failed"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).createIndustry(any(Industry.class));
        verify(webSocketService, never()).sendUpdate(anyString(), anyString());
    }

    @Test
    void testGetIndustryById_Success() throws Exception {
        // Arrange
        when(industryService.findIndustryById(INDUSTRY_ID)).thenReturn(industry);

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/industry/" + INDUSTRY_ID))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$.industryId").value(INDUSTRY_ID))
                .andExpect(jsonPath("$.industryName").value(INDUSTRY_NAME));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).findIndustryById(INDUSTRY_ID);
    }

    @Test
    void testGetIndustryById_NotFound() throws Exception {
        // Arrange
        when(industryService.findIndustryById(INDUSTRY_ID)).thenThrow(new AllExceptions("Industry not found"));

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/industry/" + INDUSTRY_ID))
                .andDo(print());

        result.andExpect(status().isNotFound())
                .andExpect(jsonPath("$").doesNotExist());

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).findIndustryById(INDUSTRY_ID);
    }

    @Test
    void testDeleteIndustry_Success() throws Exception {
        // Arrange
        when(industryService.deleteIndustry(INDUSTRY_ID)).thenReturn(true);

        // Act & Assert
        ResultActions result = mockMvc.perform(delete("/industry/" + INDUSTRY_ID)
                .with(csrf()))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(content().string("Industry deleted successfully"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).deleteIndustry(INDUSTRY_ID);
        verify(webSocketService, times(1)).sendUpdate(eq("/topic/industry-updates"), eq("DELETE INDUSTRY"));
    }

    @Test
    void testDeleteIndustry_Failure() throws Exception {
        // Arrange
        when(industryService.deleteIndustry(INDUSTRY_ID)).thenReturn(false);

        // Act & Assert
        ResultActions result = mockMvc.perform(delete("/industry/" + INDUSTRY_ID)
                .with(csrf()))
                .andDo(print());

        result.andExpect(status().isInternalServerError())
                .andExpect(content().string("Industry deletion failed"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).deleteIndustry(INDUSTRY_ID);
        verify(webSocketService, never()).sendUpdate(anyString(), anyString());
    }

    @Test
    void testDeleteIndustry_NotFound() throws Exception {
        // Arrange
        when(industryService.deleteIndustry(INDUSTRY_ID)).thenThrow(new AllExceptions("Industry not found"));

        // Act & Assert
        ResultActions result = mockMvc.perform(delete("/industry/" + INDUSTRY_ID)
                .with(csrf()))
                .andDo(print());

        result.andExpect(status().isNotFound())
                .andExpect(content().string("Industry not found"));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).deleteIndustry(INDUSTRY_ID);
        verify(webSocketService, never()).sendUpdate(anyString(), anyString());
    }

    @Test
    void testSearchIndustry_Success() throws Exception {
        // Arrange
        List<Industry> industries = Arrays.asList(industry);
        when(industryService.searchIndustry(SEARCH_QUERY)).thenReturn(industries);

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/industry/search")
                .param("query", SEARCH_QUERY))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$[0].industryId").value(INDUSTRY_ID))
                .andExpect(jsonPath("$[0].industryName").value(INDUSTRY_NAME));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).searchIndustry(SEARCH_QUERY);
    }

    @Test
    void testSearchIndustry_EmptyResult() throws Exception {
        // Arrange
        when(industryService.searchIndustry(SEARCH_QUERY)).thenReturn(Collections.emptyList());

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/industry/search")
                .param("query", SEARCH_QUERY))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).searchIndustry(SEARCH_QUERY);
    }

    @Test
    void testCountJobByIndustry_Success() throws Exception {
        // Arrange
        List<CountJobByIndustry> counts = Arrays.asList(countJobByIndustry);
        when(industryRepository.countJobsByIndustry()).thenReturn(counts);

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/industry/countJobByIndustry"))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$[0].industryName").value(INDUSTRY_NAME))
                .andExpect(jsonPath("$[0].jobCount").value(JOB_COUNT));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryRepository, times(1)).countJobsByIndustry();
    }

    @Test
    void testCountJobByIndustry_EmptyResult() throws Exception {
        // Arrange
        when(industryRepository.countJobsByIndustry()).thenReturn(Collections.emptyList());

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/industry/countJobByIndustry"))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryRepository, times(1)).countJobsByIndustry();
    }

    @Test
    void testGetCountIndustry_Success() throws Exception {
        // Arrange
        List<CountJobByIndustry> counts = Arrays.asList(countJobByIndustry);
        when(industryService.getIndustryCount()).thenReturn(counts);

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/industry/count-industry"))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$[0].industryName").value(INDUSTRY_NAME))
                .andExpect(jsonPath("$[0].jobCount").value(JOB_COUNT));

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).getIndustryCount();
    }

    @Test
    void testGetCountIndustry_EmptyResult() throws Exception {
        // Arrange
        when(industryService.getIndustryCount()).thenReturn(Collections.emptyList());

        // Act & Assert
        ResultActions result = mockMvc.perform(get("/industry/count-industry"))
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        // Log response
        System.out.println("Response Body: " + result.andReturn().getResponse().getContentAsString());

        verify(industryService, times(1)).getIndustryCount();
    }
}